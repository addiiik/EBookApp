"use client";

import { Suspense } from "react";
import SignInInner from "./signin";

export default function SignInPageSuspenseWrapper() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}