"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import Icons from "@/app/components/Icons/page"; // Assurez-vous d'importer le type Icon
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Globe, Facebook, Instagram } from "lucide-react";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async (
    provider: "google" | "facebook" | "instagram"
  ) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Button
          variant="outline"
          onClick={() => handleSignIn("google")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Globe className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSignIn("facebook")}
          disabled={isLoading}
          className="bg-[#1877F2] text-white hover:bg-[#166fe5] hover:text-white"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Facebook className="mr-2 h-4 w-4" />
          )}
          Facebook
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSignIn("instagram")}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Instagram className="mr-2 h-4 w-4" />
          )}
          Instagram
        </Button>
      </div>
    </div>
  );
}
