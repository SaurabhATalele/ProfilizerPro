"use client";
import  { FC, useEffect, useState, useContext, Suspense } from "react";
import Button from "@/Components/examDash/Button";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/Components/Loader/Loader";
import TopicContext from "@/Utils/TestContext";
import { getUser } from "@/Utils/Apicalls/User";

interface Question {
  question: string;
  options: string[];
  answer: string;
  number: number;
  status: "unattempted" | "attempted" | "marked";
}

interface TopicContextType {
  topics: {
    topic: string;
    subtopics: Record<string, string>;
  };
  setTopics: (value: { topic: string; subtopics: Record<string, string> }) => void;
}

const ExamDash: FC = () => {
  const [ques, setQues] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { topics } = useContext(TopicContext) as TopicContextType;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const router = useRouter();
  const pathname = usePathname();

  const path = pathname.split("/");
  const testId = path[3];

  let count = 1;

  useEffect(() => {
    const getQuestions = async (): Promise<void> => {
      try {
        setLoading(true);
        const subtopics = JSON.stringify(topics.subtopics);
        const res = await axios.post("/api/v1/generate-test", {
          prompt: { topic: topics.topic, questions: subtopics },
        });
        console.log(res.data);
        const valuesArray: Question[] = Object.values(
          res.data.response as Record<string, Array<{ question: string; options: string[]; answer: string }>>,
        ).flatMap((category) => category.map((question) => question)) as Question[];

        for (let i = 0; i < valuesArray.length; i++) {
          valuesArray[i].number = i + 1;
          valuesArray[i].status = "unattempted";
        }

        console.log(valuesArray);
        setQues(valuesArray);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (count === 1) {
      getQuestions();
      count++;
    }

    return () => {
      setQues([]);
      setAnswers({});
    };
  }, []);

  const submitTest = async (): Promise<void> => {
    const questionsAndAnswers: Array<{
      question: string;
      answer: string;
      yourAnswer: string;
    }> = [];
    let calculatedScore = 0;
    for (let i = 0; i < ques.length; i++) {
      questionsAndAnswers.push({
        question: ques[i].question,
        answer: ques[i].answer,
        yourAnswer: answers[i],
      });
      if (answers[i] === ques[i].answer) {
        calculatedScore++;
      }
    }

    let email = "";
    try {
      const resp = await getUser();
      const userData = await resp.json();
      if (userData && userData.email) {
        email = userData.email;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }

    console.log(questionsAndAnswers, testId);
    const res = await axios.put("/api/v1/assignment", {
      questions: questionsAndAnswers,
      id: testId,
      total: ques.length,
      score: calculatedScore,
      email,
    });
    console.log(res.data);
    router.push("/success");
  };

  return (
    <div className="w-full py-20">
      <Suspense fallback={<Loader />}>
        {loading ? (
          <Loader />
        ) : (
          <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-10rem)] bg-white text-black dark:bg-[#0c0c0c] dark:text-white">
            {/* Sidebar: question navigator */}
            <aside className="flex flex-col justify-between w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Questions
                </h3>
                <div className="grid grid-cols-6 lg:grid-cols-10 gap-3">
                  {ques.map((ele) => (
                    <Button
                      key={ele.number}
                      num={ele.number}
                      current={currentQuestion + 1}
                      setCurrent={setCurrentQuestion}
                      status={ques[ele.number - 1].status}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
                    Unattempted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-green-500" />
                    Attempted
                  </span>
                </div>
              </div>

              <button
                onClick={submitTest}
                className="mt-8 w-full py-3 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium rounded-lg shadow-md transition-all duration-200 hover:opacity-90"
              >
                Submit Test
              </button>
            </aside>

            {/* Main: current question */}
            <section className="flex flex-col justify-between w-full lg:w-2/3 p-6 lg:p-10">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-primary)]/10 dark:bg-[var(--color-secondary)]/15 text-[var(--color-primary)] dark:text-[var(--color-secondary)]">
                    Question {currentQuestion + 1} of {ques.length}
                  </span>
                </div>

                <h2 className="text-xl lg:text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-8">
                  {ques && ques[currentQuestion]?.question}
                </h2>

                <div className="flex flex-col gap-3 max-w-2xl">
                  {ques[currentQuestion]?.options &&
                    ques[currentQuestion]?.options.map((item) => {
                      const isSelected = answers[currentQuestion] === item;
                      return (
                        <label
                          key={item}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-[var(--color-primary)] dark:border-[var(--color-secondary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-secondary)]/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/40"
                          }`}
                        >
                          <input
                            type="radio"
                            value={item}
                            name={`question-${currentQuestion}`}
                            checked={isSelected}
                            className="w-4 h-4 accent-[var(--color-primary)] dark:accent-[var(--color-secondary)]"
                            onChange={() => {
                              setAnswers((prev) => ({ ...prev, [currentQuestion]: item }));
                              setQues((prev) => {
                                const updated = [...prev];
                                updated[currentQuestion].status = "attempted";
                                return updated;
                              });
                            }}
                          />
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {item}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      currentQuestion === ques.length - 1 ? 0 : currentQuestion + 1,
                    )
                  }
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium shadow-md transition-all duration-200 hover:opacity-90"
                >
                  Next
                </button>
              </div>
            </section>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default ExamDash;
