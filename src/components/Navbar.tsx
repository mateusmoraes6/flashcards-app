"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import NewCardMenu from "@/components/NewCardMenu";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
    { label: "Revisar", href: "/review", icon: <ReviewIcon /> },
    { label: "Stats", href: "/stats", icon: <StatsIcon /> },
    { label: "Novo Card", href: "/new", icon: <PlusIcon />, mobileOnly: true },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed inset-y-0 left-0 w-20 lg:w-64 bg-surface/80 backdrop-blur-xl border-r border-border hidden md:flex flex-col z-50"
      >
        <div className="p-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_24px_rgba(99,102,241,0.7)] transition-all">
              <span className="text-white font-bold font-display">L</span>
            </div>
            <span className="font-display font-bold text-text tracking-tight text-lg hidden lg:block">LexiFlash</span>
          </Link>
        </div>

        <div className="px-3 lg:px-6 pt-2 pb-4">
          <NewCardMenu variant="header" />
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.filter(item => !item.mobileOnly).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-accent/10 border border-accent/20 text-accent" 
                    : "text-text-2 hover:text-text hover:bg-surface-3"
                }`}
              >
                <div className={`${isActive ? "text-accent" : "text-text-3 group-hover:text-text-2"}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm hidden lg:block">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute left-0 w-1 h-6 bg-accent rounded-r-full hidden lg:block"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {/* Settings Link */}
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
              pathname === "/settings" 
                ? "bg-accent/10 border border-accent/20 text-accent" 
                : "text-text-2 hover:text-text hover:bg-surface-3"
            }`}
          >
            <div className={`${pathname === "/settings" ? "text-accent" : "text-text-3 group-hover:text-text-2"}`}>
              <SettingsIcon />
            </div>
            <span className="font-medium text-sm hidden lg:block">Configurações</span>
          </Link>

          {/* User Profile / Logout */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-surface-3 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-surface-3 border border-border flex items-center justify-center text-xs font-bold text-text-2">
                U
              </div>
              <div className="flex-1 text-left hidden lg:block">
                <p className="text-xs font-bold text-text truncate tracking-tight leading-none mb-0.5">Usuário</p>
                <p className="text-[10px] text-text-3 truncate leading-none">Minha conta</p>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-48 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden z-10 p-1"
                  >
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <LogoutIcon />
                      Sair da conta
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-surface/80 backdrop-blur-xl border-t border-border flex items-center justify-around md:hidden z-50 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all ${
                isActive ? "text-accent" : "text-text-3"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div layoutId="mobileActive" className="absolute bottom-1.5 w-1 h-1 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all ${
            pathname === "/settings" ? "text-accent" : "text-text-3"
          }`}
        >
          <SettingsIcon />
          <span className="text-[10px] font-medium">Conta</span>
        </Link>
      </nav>

      {/* Floating Action Button (Alternative to mobile New Card) */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <NewCardMenu variant="page" />
      </div>
    </>
  );
}

// Icons (Internalized SVGs for premium look without extra dependencies)
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

