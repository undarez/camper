"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Info, Mail, MapPin, Map, Settings, Users } from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/pages/StationCard", label: "Stations", icon: MapPin },
  { href: "/components/localisationStation2", label: "Carte", icon: Map },
  { href: "/pages/Contact", label: "Contact", icon: Mail },
  { href: "/pages/About", label: "À propos", icon: Info },
];

const adminItems = [
  {
    href: "/pages/AdminStation",
    label: "Gestion des stations",
    icon: Settings,
  },
  { href: "/pages/AdminUsers", label: "Gestion des utilisateurs", icon: Users },
];

const MobileSidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fermeture automatique lors du changement de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="burger-button">
          <div className="flex flex-col gap-1.5">
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col h-full">
          {/* En-tête */}
          <div className="border-b p-4">
            <div className="flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="CamperWash Logo"
                width={150}
                height={40}
                className="object-contain"
              />
            </div>
          </div>

          {/* Menu principal */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <>
                  <div className="my-4 border-t" />
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </nav>

          {/* Pied de page */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} CamperWash
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
