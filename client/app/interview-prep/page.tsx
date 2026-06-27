import { getNavTree } from "@/Utils/api/Controllers/SubjectController";
import SubjectGrid from "@/Components/InterviewPrep/SubjectGrid";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";

// ISR: the subject tree is fetched on the server and baked into static HTML,
// revalidated once a day. Visitors render the tiles with no client DB fetch.
export const revalidate = 86400; // 1 day, in seconds

/**
 * Interview Prep home (subject tile grid). Statically generated via ISR: the
 * published nav tree is read server-side and passed to the client tiles.
 */
const Page = async () => {
  let subjects: NavTreeSubject[] = [];
  try {
    const tree = await getNavTree(false);
    // Serialize Mongo types (ObjectId/Date) to plain values for client props.
    subjects = JSON.parse(JSON.stringify(tree.subjects)) as NavTreeSubject[];
  } catch (error) {
    // If the DB is unreachable at build time, render empty; ISR fills it in on
    // the next revalidation/request.
    console.error("interview-prep home static render:", error);
  }

  // pt-16 clears the fixed global Navbar (h-16).
  return (
    <div className="min-h-screen bg-white pt-16 text-black dark:bg-black dark:text-white">
      <SubjectGrid subjects={subjects} />
    </div>
  );
};

export default Page;
