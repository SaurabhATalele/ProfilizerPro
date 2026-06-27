import mongoose from "mongoose";
import { seedInterviewPrep } from "@/Utils/api/seed/interviewPrepSeed";

// CLI entry point for seeding the predefined Interview Prep content.
// Run with a TypeScript runner that resolves the `@/` alias and loads your env
// (so MONGO_URL is set), e.g.:
//   npx tsx -r dotenv/config scripts/seedInterviewPrep.ts
// Idempotent — re-running after the first seed is a no-op.

async function main(): Promise<void> {
  const summary = await seedInterviewPrep();
  if (summary.seeded) {
    console.log(
      `Seeded Interview Prep: ${summary.subjects} subjects, ` +
        `${summary.chapters} chapters, ${summary.pages} pages.`,
    );
  } else {
    console.log("Interview Prep already seeded — skipping.");
  }
  await mongoose.connection.close();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
