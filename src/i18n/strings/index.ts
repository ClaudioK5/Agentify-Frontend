import type { AppLocale } from "../types";
import { en } from "./en";
import { ru } from "./ru";
import { it } from "./it";
export type { AppStringKey } from "./types";
export const STRINGS: Record<AppLocale, import("./types").StringPack> = { en, ru, it };
