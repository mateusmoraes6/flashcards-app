"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_24px_rgba(99,102,241,0.7)] transition-shadow">
            <span className="text-sm font-bold text-white font-display">L</span>
          </div>
          <span className="font-display font-bold text-text tracking-tight text-base">LexiFlash</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>Cards</NavLink>
          <NavLink href="/review" active={pathname === "/review"}>Revisar</NavLink>
          <NavLink href="/stats" active={pathname === "/stats"}>Stats</NavLink>

          <div className="h-5 w-px bg-border mx-2" />

          <button onClick={handleLogout} className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
            Sair
          </button>

          {/* + dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_0_12px_rgba(99,102,241,0.35)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95"
            >
              + Novo
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden z-20"
                  >
                    <Link href="/new" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-2 hover:text-text hover:bg-surface-3 transition-colors">
                      <span>✏️</span> Criar card
                    </Link>
                    <Link href="/bulk" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-2 hover:text-text hover:bg-surface-3 transition-colors border-t border-border">
                      <span>📋</span> Importar em lote
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? "bg-surface-3 text-text" : "text-text-2 hover:text-text hover:bg-surface-2"}`}>
      {children}
    </Link>
  );
}
