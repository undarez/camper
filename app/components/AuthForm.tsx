"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import type { IconType } from "react-icons";

interface AuthButtonProps {
  provider: "google" | "facebook" | "instagram";
  Icon: IconType;
  text: string;
  iconClassName?: string;
}

function AuthButton({ provider, Icon, text, iconClassName }: AuthButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => signIn(provider, { callbackUrl: "/" })}
      className="relative"
    >
      <Icon className={`mr-2 h-4 w-4 ${iconClassName || ""}`} />
      {text}
    </Button>
  );
}

export function AuthForm() {
  return (
    <div className="grid gap-6">
      <AuthButton
        provider="google"
        Icon={FcGoogle}
        text="Continuer avec Google"
      />
      <AuthButton
        provider="facebook"
        Icon={FaFacebook}
        text="Continuer avec Facebook"
        iconClassName="text-blue-600"
      />
      <AuthButton
        provider="instagram"
        Icon={FaInstagram}
        text="Continuer avec Instagram"
        iconClassName="text-pink-600"
      />
    </div>
  );
}
