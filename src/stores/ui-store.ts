import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  createdAt: number;
}

interface UIStore {
  activeModal: string | null;
  modalData: unknown;
  toasts: Toast[];
  isDialogueOpen: boolean;
  currentDialogue: { npcId: string; nodeId: string } | null;

  openModal: (id: string, data?: unknown) => void;
  closeModal: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  startDialogue: (npcId: string, nodeId: string) => void;
  closeDialogue: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  modalData: null,
  toasts: [],
  isDialogueOpen: false,
  currentDialogue: null,

  openModal: (id, data) => set({ activeModal: id, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  addToast: (message, type) => {
    const toast: Toast = { id: crypto.randomUUID(), message, type, createdAt: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast].slice(-5) }));
    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }));
    }, 3000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  startDialogue: (npcId, nodeId) => set({ isDialogueOpen: true, currentDialogue: { npcId, nodeId } }),
  closeDialogue: () => set({ isDialogueOpen: false, currentDialogue: null }),
}));
