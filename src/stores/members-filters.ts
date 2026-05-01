"use client";

import { create } from "zustand";

export interface MemberFiltersState {
  institute: string | null;
  course: number | null;
  search: string;
  setInstitute: (v: string | null) => void;
  setCourse: (v: number | null) => void;
  setSearch: (v: string) => void;
  reset: () => void;
}

export const useMemberFilters = create<MemberFiltersState>((set) => ({
  institute: null,
  course: null,
  search: "",
  setInstitute: (institute) => set({ institute }),
  setCourse: (course) => set({ course }),
  setSearch: (search) => set({ search }),
  reset: () => set({ institute: null, course: null, search: "" }),
}));
