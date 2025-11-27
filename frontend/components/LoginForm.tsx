"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginForm() {
  return (
    <div className="flex justify-center w-full">
      <SignIn routing="hash" />
    </div>
  );
}

