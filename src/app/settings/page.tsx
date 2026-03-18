"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen md:pl-20 lg:pl-64 pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-text tracking-tight mb-2">Configurações</h1>
          <p className="text-text-2">Gerencie sua conta e preferências do aplicativo.</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">👤</span>
              Perfil
            </h2>
            <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-xl border border-border/50">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                U
              </div>
              <div>
                <p className="text-text font-bold text-lg">Usuário do LexiFlash</p>
                <p className="text-text-3 text-sm italic">O email não pôde ser carregado</p>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">⚙️</span>
              Preferências
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-2/50 rounded-xl border border-border/30">
                <div>
                  <p className="text-text font-medium">Tema Escuro</p>
                  <p className="text-text-3 text-xs">O app está otimizado para modo dark.</p>
                </div>
                <div className="w-10 h-6 bg-accent rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-2/50 rounded-xl border border-border/30">
                <div>
                  <p className="text-text font-medium">Lembrete de Estudo</p>
                  <p className="text-text-3 text-xs">Receba notificações para não esquecer de revisar.</p>
                </div>
                <div className="w-10 h-6 bg-border rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* App Installation Section */}
          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">📱</span>
              Instalação do Aplicativo
            </h2>
            <div className="p-4 bg-surface-2/50 rounded-xl border border-border/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-text font-medium">Instalar LexiFlash</p>
                  <p className="text-text-3 text-xs">
                    {isInstalled 
                      ? "O aplicativo já está instalado no seu dispositivo." 
                      : "Baixe o aplicativo para usar offline e ter acesso rápido pela tela inicial."}
                  </p>
                </div>
                {!isInstalled && (
                  <button
                    onClick={handleInstallClick}
                    disabled={!isInstallable}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                      isInstallable 
                        ? "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent/90" 
                        : "bg-border text-text-3 cursor-not-allowed"
                    }`}
                  >
                    {isInstallable ? "Instalar agora" : "Já instalado ou não suportado"}
                  </button>
                )}
                {isInstalled && (
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Aplicativo instalado
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-surface border border-border rounded-2xl p-6">
             <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">✨</span>
              Sobre o App
            </h2>
            <div className="space-y-2 text-sm text-text-2">
              <p>LexiFlash v1.0.0</p>
              <p>Desenvolvido para ajudar na fixação de novos idiomas e vocabulários através de Repetição Espaçada.</p>
              <div className="pt-4 flex gap-4">
                <a href="#" className="text-accent hover:underline text-xs">Termos de Uso</a>
                <a href="#" className="text-accent hover:underline text-xs">Privacidade</a>
              </div>
            </div>
          </section>

          {/* Logout Button (Mobile Focused) */}
          <div className="pt-4 md:hidden">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair da conta
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
