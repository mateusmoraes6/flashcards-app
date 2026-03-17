"use client";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir Flashcard">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        
        <div className="text-center">
          <p className="text-text font-medium text-lg">Você tem certeza?</p>
          <p className="text-text-2 text-sm mt-1">
            Esta ação não pode ser desfeita. O flashcard <span className="text-text font-semibold italic">"{title}"</span> será removido permanentemente.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-2 hover:text-text hover:bg-surface-3 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:shadow-[0_0_24px_rgba(239,68,68,0.4)] transition-all text-sm font-medium active:scale-95"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </Modal>
  );
}
