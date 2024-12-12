"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Déplacer les styles dans un fichier CSS séparé
import styles from "@/app/components/AuthForm.module.css";

export function AuthForm() {
  return (
    <div className="grid gap-4">
      <Button
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="flex items-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 hover:border-gray-400 transition-all py-6"
      >
        <Image
          src="/images/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="flex-1 text-center">Continuer avec Google</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => signIn("facebook", { callbackUrl: "/" })}
        className="flex items-center gap-3 w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white border-none transition-all py-6"
      >
        <Image
          src="/images/facebook.svg"
          alt="Facebook"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="flex-1 text-center">Continuer avec Facebook</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => signIn("instagram", { callbackUrl: "/" })}
        className={`flex items-center gap-3 w-full text-white border-none transition-all py-6 relative overflow-hidden ${styles.instagramBtn}`}
      >
        <Image
          src="/images/instagram.svg"
          alt="Instagram"
          width={20}
          height={20}
          className="w-5 h-5 relative z-10"
        />
        <span className="flex-1 text-center relative z-10">
          Continuer avec Instagram
        </span>
      </Button>
    </div>
  );
}
