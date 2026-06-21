import { FC } from "react";

interface ButtonProps {
  num: number;
  status: "unattempted" | "attempted" | "marked";
  current?: number;
  setCurrent: (value: number) => void;
}

const Button: FC<ButtonProps> = ({ num, status, current, setCurrent }) => {
  const isCurrent = current === num;

  const base =
    "w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 border";

  let style =
    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  if (status === "attempted")
    style = "bg-green-500 text-white border-green-500";
  if (status === "marked")
    style = "bg-yellow-500 text-white border-yellow-500";
  if (isCurrent)
    style =
      "bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white border-[var(--color-primary)] dark:border-[var(--color-secondary)] ring-2 ring-[var(--color-primary)]/30 dark:ring-[var(--color-secondary)]/30";

  return (
    <button onClick={() => setCurrent(num - 1)} className={`${base} ${style}`}>
      {num}
    </button>
  );
};

export default Button;
