"use client";
import { FC } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Routes where the common Navbar should NOT appear (admin has its own layout).
const HIDDEN_PREFIXES = ["/admin"];

const ConditionalNavbar: FC = () => {
  const pathname = usePathname();
  const shouldHide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;
  return <Navbar />;
};

export default ConditionalNavbar;
