"use client";

import { createJSONStorage, type StateStorage } from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const persistStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopStorage : window.localStorage,
);
