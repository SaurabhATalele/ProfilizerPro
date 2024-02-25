import { useState } from "react";

const topic = ({ name, minQuestions, maxQuestions,setSelectedTopics }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [questions,setQuestions] = useState(0);

  const handleSelected = (e) => {
    setIsSelected(e.target.checked);
    if (!isSelected) {
      setSelectedTopics((prev) => {
        delete prev[name];
        return prev;
      })

    }
    else{
        setSelectedTopics((prev) => {
            prev[name] = questions;
            return prev;
        })
    }
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex gap-3 items-center">
        <input
          type="checkbox"
          name="tech1"
          id="tech 1"
          className="h-4 w-4 "
          onChange={handleSelected}
        />
        <label htmlFor="tech1" className="text-md font-semibold">
          {name}
        </label>
      </div>
      {isSelected && (
        <div className="flex gap-3 items-center radio-grp">
          {Array.from(
            { length: maxQuestions - minQuestions + 1 },
            (_, i) => i + (maxQuestions - minQuestions) + 1,
          ).map((i) => (
            <>
              <input type="radio" name="tech1" id={i} className="h-4 w-4" onChange={()=>setQuestions(i)} />
              <label htmlFor="tech1-1" className="text-sm">
                {i}
              </label>
            </>
          ))}
        </div>
      )}
    </li>
  );
};

export default topic;
