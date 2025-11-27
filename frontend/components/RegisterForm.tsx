"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterForm() {
  return (
    <div className="flex justify-center w-full">
      <SignUp routing="hash" />
    </div>
  );
}

