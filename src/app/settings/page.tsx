"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Category, UserLanguage } from "@/types/flashcard";
import Modal from "@/components/Modal";
import CategoryWordsModal from "@/components/CategoryWordsModal";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isLanguagesExpanded, setIsLanguagesExpanded] = useState(false);

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

    // Fetch user profile
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.full_name) {
        setNewName(user.user_metadata.full_name);
      }
    };
    fetchUser();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [supabase.auth]);

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

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsUpdating(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: newName.trim() }
    });

    if (!error) {
      setUser(data.user);
      setIsEditingName(false);
    }
    setIsUpdating(false);
  };

  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "Carregando...";

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
          <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            {/* Header / Toggle Button */}
            <button 
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-2/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 border border-indigo-500/10">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="text-left">
                  <h2 className="text-base font-bold text-text flex items-center gap-2">
                    Perfil do Usuário
                  </h2>
                  <p className="text-[11px] text-text-3 uppercase tracking-widest font-medium">
                    {isProfileExpanded ? "Ver menos" : "Ver detalhes"}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isProfileExpanded ? 180 : 0 }}
                className="text-text-3 group-hover:text-text transition-colors"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isProfileExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-6">
                    <div className="bg-surface-2/30 rounded-2xl p-5 border border-border/50">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Smaller Avatar in details */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                          {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </div>

                        <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                          <div className="space-y-0.5">
                            {isEditingName ? (
                              <div className="flex items-center gap-2 max-w-sm mx-auto sm:mx-0">
                                <input
                                  type="text"
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  className="flex-1 bg-surface border border-border rounded-xl px-3 py-1.5 text-text focus:outline-none focus:border-accent transition-all text-sm font-bold"
                                  autoFocus
                                />
                                <button
                                  onClick={handleUpdateName}
                                  disabled={isUpdating}
                                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setIsEditingName(false)}
                                  className="p-1.5 bg-surface border border-border text-text-3 rounded-lg hover:text-text transition-all"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center sm:justify-start gap-2 group/name">
                                <h3 className="text-lg font-bold text-text">
                                  {user?.user_metadata?.full_name || "Usuário"}
                                </h3>
                                <button
                                  onClick={() => setIsEditingName(true)}
                                  className="p-1 opacity-0 group-hover/name:opacity-100 text-text-3 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                  title="Editar nome"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-text-2 flex items-center justify-center sm:justify-start gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-3">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              {user?.email || "Email indisponível"}
                            </p>
                          </div>

                          <div className="flex items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-text-3 font-bold uppercase tracking-widest bg-surface/50 px-2 py-1 rounded-lg border border-border/30">
                              <span>📅 Entrou em:</span>
                              <span className="text-text-2">{joinDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </section>

          {/* Categories Section */}
          <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button 
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-2/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center text-sm border border-fuchsia-500/10">
                  📁
                </div>
                <div className="text-left">
                  <h2 className="text-base font-bold text-text flex items-center gap-2">
                    Gerenciar Categorias
                  </h2>
                  <p className="text-[11px] text-text-3 uppercase tracking-widest font-medium">
                    {isCategoriesExpanded ? "Ver menos" : "Ver opções"}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isCategoriesExpanded ? 180 : 0 }}
                className="text-text-3 group-hover:text-text transition-colors"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {isCategoriesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0">
                    <p className="text-text-3 text-sm mb-6">Crie e personalize categorias para organizar seus flashcards.</p>
                    <CategoryManager />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Languages Section */}
          <section className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <button 
              onClick={() => setIsLanguagesExpanded(!isLanguagesExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface-2/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm border border-orange-500/10">
                  🌍
                </div>
                <div className="text-left">
                  <h2 className="text-base font-bold text-text flex items-center gap-2">
                    Idiomas de Interesse
                  </h2>
                  <p className="text-[11px] text-text-3 uppercase tracking-widest font-medium">
                    {isLanguagesExpanded ? "Ver menos" : "Ver opções"}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isLanguagesExpanded ? 180 : 0 }}
                className="text-text-3 group-hover:text-text transition-colors"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {isLanguagesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0">
                    <p className="text-text-3 text-sm mb-6">Selecione os idiomas que você está estudando no momento.</p>
                    <LanguageManager />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

const PRESET_COLORS = ["#818CF8", "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#A78BFA", "#FB7185", "#4ADE80", "#2DD4BF", "#FACC15", "#94A3B8"];

function LanguageManager() {
  const { languages, addLanguage, deleteLanguage } = useFlashcards();
  const [newName, setNewName] = useState("");
  const [selectedFlag, setSelectedFlag] = useState("🇺🇸");
  const [langToDelete, setLangToDelete] = useState<UserLanguage | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addLanguage(newName.trim(), selectedFlag);
    setNewName("");
  };

  const commonFlags = ["🇺🇸", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇨🇳", "🇰🇷", "🇷🇺", "🇸🇦", "🌏"];

  return (
    <div className="space-y-6">
      <div className="p-5 bg-surface-2/40 rounded-2xl border border-border/30 backdrop-blur-sm">
        <label className="block text-[11px] font-bold text-text-3 uppercase tracking-widest mb-4">Adicionar Idioma</label>
        
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Italiano, Russo..."
                className="w-full bg-surface-3/50 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-text-3 font-bold uppercase tracking-wider">Selecione uma bandeira</p>
            <div className="flex flex-wrap gap-2">
              {commonFlags.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFlag(f)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all border ${
                    selectedFlag === f ? "bg-accent/20 border-accent scale-110" : "bg-surface-3 border-border/30 hover:border-text-3"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {languages.map((lang: UserLanguage) => (
            <motion.div
              key={lang.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group flex items-center justify-between p-3 bg-surface-2/30 border border-border/30 rounded-xl hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-text">{lang.name}</span>
              </div>
              <button
                onClick={() => setLangToDelete(lang)}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-3 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {langToDelete && (
          <Modal isOpen={true} onClose={() => setLangToDelete(null)} title="Remover Idioma">
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl block mb-2">{langToDelete.flag}</span>
                <p className="text-text font-medium text-lg">Remover {langToDelete.name}?</p>
                <p className="text-text-2 text-sm mt-1">Este idioma deixará de aparecer na criação de novos cards, mas os cards existentes não serão alterados.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setLangToDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-2 text-sm font-medium">Cancelar</button>
                <button onClick={() => { deleteLanguage(langToDelete.id); setLangToDelete(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">Remover</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryManager() {
  const { categories, cards, addCategory, deleteCategory, updateCategory } = useFlashcards();
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [catToView, setCatToView] = useState<Category | null>(null);

  const handleSave = () => {
    if (!newName.trim()) return;
    
    if (editingCat) {
      updateCategory(editingCat.id, { name: newName.trim(), color: selectedColor });
      setEditingCat(null);
    } else {
      addCategory(newName.trim(), selectedColor);
    }
    
    setNewName("");
    setSelectedColor(PRESET_COLORS[0]);
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setNewName(cat.name);
    setSelectedColor(cat.color || PRESET_COLORS[0]);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingCat(null);
    setNewName("");
    setSelectedColor(PRESET_COLORS[0]);
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
      <div className="p-5 bg-surface-2/40 rounded-2xl border border-border/30 backdrop-blur-sm relative">
        <label className="block text-[11px] font-bold text-text-3 uppercase tracking-widest mb-4">
          {editingCat ? "Editar Categoria" : "Nova Categoria"}
        </label>
        
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da categoria (Ex: Verbos)"
                className="w-full bg-surface-3/50 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-3 outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              {editingCat && (
                <button
                  onClick={cancelEdit}
                  className="px-4 py-3 border border-border text-text-3 hover:text-text rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
              >
                {editingCat ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] text-text-3 font-bold uppercase tracking-wider">Escolha uma cor</p>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="relative w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-90 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {selectedColor === color && (
                    <motion.div 
                      layoutId="colorCheck"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    </motion.div>
                  )}
                </button>
              ))}
              
              <div className="relative w-7 h-7 rounded-full border border-border/50 bg-surface-3 flex items-center justify-center overflow-hidden group">
                <span className="text-xs text-text-3 group-hover:text-text">+</span>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                  title="Cor personalizada"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {categories.map((cat: Category) => {
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(cat);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-text-3 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                    title="Editar categoria"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
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
                </div>
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

