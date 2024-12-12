"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function AuthForm() {
  return (
    <div className="grid gap-4">
      <Button
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="flex items-center gap-2"
      >
        <Image
          src="/images/google.png"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        Se connecter avec Google
      </Button>

      <Button
        variant="outline"
        onClick={() => signIn("facebook", { callbackUrl: "/" })}
        className="flex items-center gap-2"
      >
        <Image
          src="/images/facebook.png"
          alt="Facebook"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        Se connecter avec Facebook
      </Button>

      <Button
        variant="outline"
        onClick={() => signIn("instagram", { callbackUrl: "/" })}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        <Image
          src="/images/instagram.png"
          alt="Instagram"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        Se connecter avec Instagram
      </Button>
    </div>
  );
}
