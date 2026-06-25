import { createHash } from "crypto";

// Single, shared implementation of the deterministic JD hash used as
// provenance (`generatedFrom.jdHash`) on every Generated_Question_Set and as
// `jdHash` on every Job_Description.
//
// Both JD_Parser (Stage 1) and Question_Generator (Stage 2) MUST hash
// identically so the same JD text always produces the same hash regardless of
// which controller computes it. To guarantee that single implementation, the
// helper lives here and is imported by both controllers rather than being
// duplicated. See .kiro/specs/jd-question-generator/design.md
// (Property 11: "jdHash is a deterministic function of the normalized raw JD
// text").

/**
 * Normalize raw JD text before hashing so cosmetic differences (leading or
 * trailing whitespace, runs of internal whitespace, letter case) do not change
 * the resulting hash. Deterministic and idempotent.
 */
export const normalizeForHash = (rawText: string): string =>
  rawText.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Deterministic SHA-256 hex digest of the normalized raw JD text. The same JD
 * text (modulo the normalization above) always yields the same hash.
 */
export const jdHash = (rawText: string): string =>
  createHash("sha256").update(normalizeForHash(rawText)).digest("hex");
