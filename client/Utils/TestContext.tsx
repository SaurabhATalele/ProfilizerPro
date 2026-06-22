"use client";
import  { createContext, useState, ReactNode } from "react";

export interface Topic {
  topic: string;
  subtopics: Record<string, any>;
  difficulty?: "easy" | "medium" | "hard";
  customAssignmentId?: string;
  [key: string]: any;
}

interface TestContextType {
  topics: Topic;
  setTopics: (topics: Topic) => void;
}

const initialState: Topic = {
  topic: "Default Topic",
  subtopics: {},
};

export const TestContext = createContext<TestContextType | undefined>(undefined);

interface TestProviderProps {
  children: ReactNode;
}

export const TestProvider = ({ children }: TestProviderProps) => {
  const [topics, setTopics] = useState<Topic>(initialState);

  return (
    <TestContext.Provider value={{ topics, setTopics }}>
      {children}
    </TestContext.Provider>
  );
};

export default TestContext;
