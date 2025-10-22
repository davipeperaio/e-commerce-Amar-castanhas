import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WeightOption, ProductPrice } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function validateMargin(margin: number): { valid: boolean; error?: string } {
  if (isNaN(margin)) {
    return { valid: false, error: 'Margem deve ser um número' };
  }
  if (margin < 0) {
    return { valid: false, error: 'Margem não pode ser negativa' };
  }
  if (margin > 1000) {
    return { valid: false, error: 'Margem muito alta (máximo 1000%)' };
  }
  return { valid: true };
}

export function calculateRetailPrices(precoCompraPorKg: number, margem: number): ProductPrice {
  const pricePerKg = precoCompraPorKg * (1 + margem / 100);
  
  return {
    "200g": pricePerKg * 0.2,
    "500g": pricePerKg * 0.5,
    "1kg": pricePerKg,
  };
}

export function calculateWholesalePrice(precoCompraPorKg: number, weightKg: number, margem: number): number {
  return precoCompraPorKg * weightKg * (1 + margem / 100);
}

// Returns sale price for 1kg based on base price and margin
export function calculateSalePrice(precoCompraPorKg: number, margem: number): number {
  return calculateRetailPrices(precoCompraPorKg, margem)["1kg"];
}

export function getWeightInKg(weight: WeightOption): number {
  const weightMap = {
    "200g": 0.2,
    "500g": 0.5,
    "1kg": 1,
  };
  return weightMap[weight];
}

// Derive margin from existing prices when margem is not stored on Product
export function deriveMarginFromPrices(precoCompraPorKg: number, prices: ProductPrice): number {
  const salePerKg = prices["1kg"];
  if (!precoCompraPorKg || !salePerKg) return 35;
  const ratio = salePerKg / precoCompraPorKg;
  return (ratio - 1) * 100;
}

// Normalize strings for matching (remove diacritics, lowercase, trim)
export function normalizeKey(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();
}

// Parse Brazilian formatted currency/number (e.g., "R$ 36,50", "1.234,56")
export function parseBRNumber(value: unknown): number {
  if (value === null || value === undefined) return NaN;
  const s = String(value).trim();
  if (!s) return NaN;
  // remove currency and spaces
  const cleaned = s
    .replace(/\s+/g, "")
    .replace(/^R\$?/i, "")
    .replace(/\./g, "") // thousands
    .replace(/,/g, "."); // decimal
  const n = parseFloat(cleaned);
  return isNaN(n) ? NaN : n;
}

export function parsePercentBR(value: unknown): number {
  const s = String(value ?? "").trim();
  if (!s) return NaN;
  const cleaned = s.replace(/%/g, "").replace(/\s+/g, "");
  const n = parseBRNumber(cleaned);
  return isNaN(n) ? NaN : n;
}

// CSV parser with delimiter auto-detection and quoted fields support
export function parseCSV(csvText: string): any[] {
  // Normalize newlines and strip BOM if present
  const text = csvText.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const firstLine = text.split("\n", 1)[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delim = semiCount > commaCount ? ";" : ",";

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delim && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map(v => v.trim());
  };

  const lines = text.split("\n");
  if (lines.length < 2) return [];
  const headersRaw = parseLine(lines[0]);
  const headers = headersRaw.map(h => h.replace(/^\uFEFF/, "").trim());
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx];
    });
    data.push(obj);
  }
  return data;
}
