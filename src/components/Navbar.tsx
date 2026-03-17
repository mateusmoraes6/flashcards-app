"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import NewCardMenu from "@/components/NewCardMenu";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // Can keep it if needed for mobile menu, but wait, is there a mobile menu?
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border glass"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_24px_rgba(99,102,241,0.7)] transition-shadow">
            <span className="text-sm font-bold text-white font-display">L</span>
          </div>
          <span className="font-display font-bold text-text tracking-tight text-base hidden sm:block">LexiFlash</span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>Cards</NavLink>
          <NavLink href="/review" active={pathname === "/review"}>Revisar</NavLink>
          <NavLink href="/stats" active={pathname === "/stats"}>Stats</NavLink>

          <div className="h-5 w-px bg-border mx-1 sm:mx-2" />

          <button onClick={handleLogout} className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
            Sair
          </button>

          <div className="ml-1 sm:ml-2">
            <NewCardMenu variant="header" />
          </div>

        </nav>
      </div>
    </motion.header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? "bg-surface-3 text-text" : "text-text-2 hover:text-text hover:bg-surface-2"}`}>
      {children}
    </Link>
  );
}
