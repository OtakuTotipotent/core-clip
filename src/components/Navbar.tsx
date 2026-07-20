"use client";

import {
  DollarSignIcon,
  FolderEditIcon,
  GalleryHorizontalEnd,
  MenuIcon,
  SparkleIcon,
  XIcon,
} from "lucide-react";
import { PrimaryButton } from "./Buttons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useClerk, UserButton, useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [planSlug, setPlanSlug] = useState("starter");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Create", href: "/generate" },
    { name: "Community", href: "/community" },
    { name: "Plans", href: "/plans" },
  ];

  useEffect(() => {
    if (!isUserLoaded || !user) return;

    const loadCredits = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setCredits(0);
          setPlanSlug("starter");
          return;
        }

        const res = await fetch("/api/user/credits", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        setCredits(data.credits ?? 0);
        setPlanSlug(data.planSlug ?? "starter");
      } catch (error) {
        toast.error((error as Error).message);
      }
    };

    void loadCredits();

    window.addEventListener("focus", loadCredits);
    return () => {
      window.removeEventListener("focus", loadCredits);
    };
  }, [getToken, isUserLoaded, pathname, user]);

  return (
    <motion.nav
      className="fixed top-2 left-0 right-0 z-50 px-2"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1 shadow-lg">
        <Link href="/" onClick={() => window.scrollTo(0, 0)}>
          <Image
            src="/logo.svg"
            alt="logo"
            className="h-12.5 w-auto"
            style={{ width: "auto", height: "50px" }}
            width={96}
            height={32}
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => window.scrollTo(0, 0)}
              className="hover:text-pink-500 transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {!user ? (
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => void openSignIn()}
              className="text-sm font-medium text-gray-300 hover:text-pink-500 transition max-sm:hidden"
            >
              Sign in
            </button>
            <PrimaryButton
              onClick={() => void openSignUp()}
              className="max-sm:text-xs hidden sm:inline-block"
            >
              Get Started
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1">
            <span className="text-xs font-semibold text-gray-300 select-none">
              Credits: <span className="text-pink-500">{credits}</span>
            </span>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="Generate"
                  labelIcon={<SparkleIcon size={14} />}
                  onClick={() => router.push("/generate")}
                />
                <UserButton.Action
                  label="My Generations"
                  labelIcon={<FolderEditIcon size={14} />}
                  onClick={() => router.push("/my-generations")}
                />
                <UserButton.Action
                  label="Community"
                  labelIcon={<GalleryHorizontalEnd size={14} />}
                  onClick={() => router.push("/community")}
                />
                <UserButton.Action
                  label="Plans"
                  labelIcon={<DollarSignIcon size={14} />}
                  onClick={() => router.push("/plans")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        )}

        {!user && (
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            <MenuIcon className="size-6" />
          </button>
        )}
      </div>

      <div
        className={`flex flex-col items-center justify-center gap-6 text-lg font-medium fixed inset-0 bg-black/50 backdrop-blur-md z-50 transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="hover:text-pink-500"
          >
            {link.name}
          </Link>
        ))}

        <button
          onClick={() => {
            setIsOpen(false);
            void openSignIn();
          }}
          className="font-medium text-gray-300 hover:text-pink-500 transition"
        >
          Sign in
        </button>
        <PrimaryButton
          onClick={() => {
            setIsOpen(false);
            void openSignUp();
          }}
        >
          Get Started
        </PrimaryButton>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md bg-pink-700 p-2 text-white hover:bg-pink-500 ring-white active:ring-2"
        >
          <XIcon />
        </button>
      </div>
    </motion.nav>
  );
}
