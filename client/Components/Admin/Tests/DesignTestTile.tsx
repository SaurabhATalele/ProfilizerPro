
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export const DesignTestTile = ()=>{
    return (
        <Link
        href="/explore"
        className="relative flex flex-col items-center justify-center gap-4 rounded-2xl p-6 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary)]/15 dark:from-[var(--color-primary)]/10 dark:to-[var(--color-primary)]/20 border-2 border-dashed border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl text-[var(--color-primary)]">✦</span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center">
          Design Your Own Test
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          Create a personalized AI-generated assessment tailored to your specific topics and skill level.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[var(--color-primary)] font-medium text-sm group-hover:gap-3 transition-all">
          Get Started <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    )
}