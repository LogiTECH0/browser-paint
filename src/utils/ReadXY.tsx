import { create } from "zustand";

type Coords = { x1: number; y1: number; x2: number; y2: number } | null;

interface CoordsState {
  coords: Coords;
  setFirst: (x: number, y: number) => void;
  setSecond: (x: number, y: number) => void;
}

export const useCoordsStore = create<CoordsState>((set) => ({
  coords: null,

  setFirst: (x, y) =>
    set(() => ({
      coords: { x1: x, y1: y, x2: 0, y2: 0 },
    })),

  setSecond: (x, y) =>
    set((state) =>
      state.coords
        ? { coords: { ...state.coords, x2: x, y2: y } }
        : { coords: { x1: 0, y1: 0, x2: x, y2: y } }
    ),
}));
