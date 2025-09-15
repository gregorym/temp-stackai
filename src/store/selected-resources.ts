import { atom } from "jotai";

export const selectedResourcesAtom = atom<Set<string>>(new Set());