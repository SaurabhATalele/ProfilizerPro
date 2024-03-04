"use client";
import React, { createContext, useState } from "react";

// Create a context object
const TopicContext = createContext();

// Create a provider component
export const TopicProvider = ({ children }) => {
  // State to manage topics and subtopics
  const [topics, setTopics] = useState({
    topic: "Default Topic",
    subtopics: {},
  });

  return (
    <TopicContext.Provider value={{ topics, setTopics }}>
      {children}
    </TopicContext.Provider>
  );
};

export default TopicContext;
