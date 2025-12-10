import pandas as pd
import json
import os

def extract_constants():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'survey_results_public.csv')

    print(f"Reading {csv_path}...")
    
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Error: Could not find file at {csv_path}")
        return

    # Helper function to extract unique values from semicolon-separated columns
    def get_unique_values(column_name):
        if column_name not in df.columns:
            print(f"Warning: Column {column_name} not found in CSV")
            return []
        
        # Drop NaNs, convert to string, split by ';', explode list, strip whitespace, get unique
        values = df[column_name].dropna().astype(str).str.split(';').explode().str.strip().unique()
        return sorted(values.tolist())

    # Extract data
    dev_roles = get_unique_values('DevType')
    languages = get_unique_values('LanguageHaveWorkedWith')
    databases = get_unique_values('DatabaseHaveWorkedWith')
    platforms = get_unique_values('PlatformHaveWorkedWith')
    frameworks = get_unique_values('WebframeHaveWorkedWith')
    
    # Country is usually single value, but let's be safe
    countries = sorted(df['Country'].dropna().unique().tolist())

    # formatting helper
    def format_ts_array(name, values):
        # Escape quotes in values if necessary
        formatted_values = [v.replace("'", "\\'") for v in values]
        js_array_str = "[\n  '" + "',\n  '".join(formatted_values) + "'\n]"
        return f"export const {name} = {js_array_str};\n"

    # Generate output
    print("\n--- TYPESCRIPT OUTPUT START ---\n")
    
    print(format_ts_array('DEV_ROLES', dev_roles))
    print(format_ts_array('LANGUAGES', languages))
    print(format_ts_array('DATABASES', databases))
    print(format_ts_array('PLATFORMS', platforms))
    print(format_ts_array('FRAMEWORKS', frameworks))
    print(format_ts_array('COUNTRIES', countries))
    
    print("\n--- TYPESCRIPT OUTPUT END ---\n")

if __name__ == "__main__":
    extract_constants()