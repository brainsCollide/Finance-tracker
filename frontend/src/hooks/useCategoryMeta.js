import { useMemo } from "react";
import { useCategoryStore } from "../stores/category.store";
import { getCategoryIcon } from "../utils/categoryIcons";

const titleCase = (key) =>
  String(key || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// key -> { label, icon, color }. Kalau kategori tidak ditemukan (belum
// ter-load), tampil sebagai versi rapi dari key-nya, bukan error.
export const useCategoryMeta = () => {
  const categories = useCategoryStore((s) => s.categories);

  return useMemo(() => {
    const byKey = new Map(categories.map((c) => [c.key, c]));

    const getMeta = (key) => {
      const found = byKey.get(String(key || "").toLowerCase());

      return {
        key,
        label: found?.label ?? (titleCase(key) || "Other"),
        icon: getCategoryIcon(found?.icon),
        color: found?.color ?? "#64748B",
      };
    };

    return { getMeta, categories };
  }, [categories]);
};