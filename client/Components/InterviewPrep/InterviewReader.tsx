"use client";
import { FC } from "react";
import InterviewDeskLayout from "@/Components/InterviewPrep/InterviewDeskLayout";
import PageReader from "@/Components/InterviewPrep/PageReader";
import type {
  NavTreeSubject,
  PageDetailResponse,
} from "@/Utils/types/InterviewPrep";

interface InterviewReaderProps {
  subjects: NavTreeSubject[];
  totalPages: number;
  initialPage: PageDetailResponse;
}

/**
 * Client shell for the reader route: the desk layout (sidebar tree) wrapping
 * the note reader. All content is supplied by the statically generated (ISR)
 * page, so no database fetch is needed to render.
 */
const InterviewReader: FC<InterviewReaderProps> = ({
  subjects,
  totalPages,
  initialPage,
}) => {
  return (
    <InterviewDeskLayout subjects={subjects} totalPages={totalPages}>
      <PageReader initialPage={initialPage} />
    </InterviewDeskLayout>
  );
};

export default InterviewReader;
