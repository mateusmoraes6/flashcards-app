"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Category } from "@/types/flashcard";
import Modal from "@/components/Modal";
import CategoryWordsModal from "@/components/CategoryWordsModal";

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

          {/* Categories Section */}
          <section className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center text-sm">📁</span>
              Gerenciar Categorias
            </h2>
            <p className="text-text-3 text-sm mb-6">Crie e personalize categorias para organizar seus flashcards.</p>
            
            <CategoryManager />
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
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${isInstallable
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

function CategoryManager() {
  const { categories, cards, addCategory, deleteCategory } = useFlashcards();
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#818CF8");
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [catToView, setCatToView] = useState<Category | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), selectedColor);
    setNewName("");
  };

  const getCardsInCat = (catName: string) => {
    return cards.filter(c => c.category === catName).length;
  };

  const confirmDelete = () => {
    if (catToDelete) {
      deleteCategory(catToDelete.id);
      setCatToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Category Form - Improved Layout */}
      <div className="p-5 bg-surface-2/40 rounded-2xl border border-border/30 backdrop-blur-sm">
        <label className="block text-[11px] font-bold text-text-3 uppercase tracking-widest mb-4">Nova Categoria</label>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-stretch gap-2.5">
            {/* Unified Color + Input Group */}
            <div className="flex-1 flex items-center bg-surface-3/50 border border-border rounded-xl focus-within:border-accent transition-all pl-2 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer shadow-sm">
                <div 
                  className="w-full h-full transform group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: selectedColor }}
                />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                  title="Cor da categoria"
                />
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Verbos"
                className="flex-1 bg-transparent border-none px-3 py-3 text-sm text-text placeholder-text-3 focus:ring-0 outline-none"
              />
            </div>
            
            {/* Add Button - Desktop view (visible in sm+) */}
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="hidden sm:flex items-center justify-center px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Adicionar
            </button>
          </div>

          {/* Color Code & Info (Mobile/Compact context) */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-text-3 uppercase font-mono tracking-tight bg-surface-3/50 px-2 py-0.5 rounded border border-border/20">{selectedColor}</span>
            <span className="text-[10px] text-text-3 italic">← toque no ícone para mudar a cor</span>
          </div>

          {/* Add Button - Mobile view (visible only on xs) */}
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="sm:hidden w-full flex items-center justify-center py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
          >
            Adicionar Categoria
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {categories.map((cat: any) => {
            const count = getCardsInCat(cat.name);
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex items-center justify-between p-3 bg-surface-2/30 border border-border/30 rounded-xl hover:border-accent/40 hover:bg-surface-3/40 transition-all cursor-pointer"
                onClick={() => setCatToView(cat)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{cat.name}</p>
                    <p className="text-[10px] text-text-3">{count} card{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatToDelete(cat);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-text-3 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Excluir categoria"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {catToDelete && (
          <Modal isOpen={true} onClose={() => setCatToDelete(null)} title="Excluir Categoria">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-text font-medium text-lg">Tem certeza?</p>
                <p className="text-text-2 text-sm mt-1">
                  A categoria <span className="text-text font-bold">"{catToDelete.name}"</span> será removida. 
                  {getCardsInCat(catToDelete.name) > 0 ? (
                    <span className="block mt-2 text-amber-400">
                      ⚠️ {getCardsInCat(catToDelete.name)} flashcards ficarão sem categoria (sem classificação).
                    </span>
                  ) : (
                    " Esta ação não pode ser desfeita."
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCatToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-2 hover:text-text hover:bg-surface-3 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all text-sm font-bold active:scale-95"
                >
                  Excluir agora
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Category Words Modal (Duolingo Style) */}
      {catToView && (
        <CategoryWordsModal
          isOpen={!!catToView}
          onClose={() => setCatToView(null)}
          category={catToView}
          cards={cards}
        />
      )}
    </div>
  );
}

