import { create } from 'zustand';

interface LightboxState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  openLightbox: (images: string[], startIndex?: number) => void;
  closeLightbox: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useLightboxStore = create<LightboxState>((set) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,
  openLightbox: (images, startIndex = 0) => set({ isOpen: true, images, currentIndex: startIndex }),
  closeLightbox: () => set({ isOpen: false }),
  nextImage: () => set((state) => ({
    currentIndex: state.currentIndex < state.images.length - 1 ? state.currentIndex + 1 : 0
  })),
  prevImage: () => set((state) => ({
    currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : state.images.length - 1
  })),
}));
