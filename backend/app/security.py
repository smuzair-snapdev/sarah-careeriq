import requests
from jose import jwt
from fastapi import HTTPException
from .config import get_settings

settings = get_settings()

# Simple in-memory cache for JWKS to avoid fetching on every request
# In a real production app, use a more robust caching strategy
_jwks_cache = {}

def get_jwks(issuer_url: str = None):
    if _jwks_cache and (not issuer_url or settings.CLERK_ISSUER_URL):
        return _jwks_cache
    
    url_to_use = issuer_url or settings.CLERK_ISSUER_URL
    
    try:
        if not url_to_use:
            print("Warning: No issuer URL available for JWKS.")
            return {}
            
        jwks_url = f"{url_to_use}/.well-known/jwks.json"
        response = requests.get(jwks_url)
        response.raise_for_status()
        data = response.json()
        _jwks_cache.update(data)
        return data
    except Exception as e:
        print(f"Error fetching JWKS from {url_to_use}: {e}")
        return {}

def verify_clerk_token(token: str):
    try:
        # First decode unverified to get the issuer if not configured
        unverified_claims = jwt.get_unverified_claims(token)
        issuer = settings.CLERK_ISSUER_URL or unverified_claims.get("iss")
        
        if not issuer:
             raise HTTPException(status_code=500, detail="Could not determine token issuer")

        jwks = get_jwks(issuer)
        if not jwks:
            raise HTTPException(status_code=500, detail="Auth configuration error (JWKS fetch failed)")

        # Get the header to find the Key ID (kid)
        header = jwt.get_unverified_header(token)
        rsa_key = {}
        
        for key in jwks.get("keys", []):
            if key["kid"] == header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token key")

        # Verify the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            issuer=issuer,
            # Clerk access tokens often don't have an audience by default unless configured
            options={"verify_aud": False}
        )
        return payload
        
    except jwt.ExpiredSignatureError:
        print("Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError as e:
        print(f"Claims error: {e}")
        raise HTTPException(status_code=401, detail="Incorrect claims")
    except Exception as e:
        print(f"Token validation error: {e}")
        # issuer might not be defined if error occurs early
        try:
            print(f"Issuer used: {issuer}")
        except UnboundLocalError:
            print("Issuer not determined before error")
        raise HTTPException(status_code=401, detail=f"Unable to validate credentials: {str(e)}")