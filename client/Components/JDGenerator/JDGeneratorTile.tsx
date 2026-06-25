"use client";
import { FC } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

/**
 * Promotional CTA tile linking to the JD Question Generator feature
 * (`/jd-question-generator`). Mirrors the visual language of
 * `DesignTestTile` so it can sit alongside assessment cards on the
 * home page and the all-tests page.
 */
const JDGeneratorTile: FC = () => {
  return (
    <Link
      href="/jd-question-generator"
      className="relative flex flex-col items-center justify-center gap-4 rounded-2xl p-6 bg-gradient-to-br from-[var(--color-secondary)]/5 to-[var(--color-secondary)]/15 dark:from-[var(--color-secondary)]/10 dark:to-[var(--color-secondary)]/20 border-2 border-dashed border-[var(--color-secondary)]/40 hover:border-[var(--color-secondary)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)]/10 dark:bg-[var(--color-secondary)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <FileText className="w-8 h-8 text-[var(--color-secondary)]" />
      </div>
      <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center">
        JD Test Generator
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
        Paste a job description and attempt an AI-tailored test matched to the
        role&apos;s skills, right away.
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[var(--color-secondary)] font-medium text-sm group-hover:gap-3 transition-all">
        Start Now <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default JDGeneratorTile;
