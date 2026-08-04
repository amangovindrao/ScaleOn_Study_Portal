"use client";

import { useState } from "react";
import { Quiz } from "../types";
import { CheckCircle, XCircle } from "lucide-react";

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const scorePercent = submitted
    ? Math.round(
        (quiz.questions.filter((q) => answers[q.id] === q.correctOptionIndex).length / quiz.questions.length) * 100
      )
    : null;
  const passed = scorePercent !== null && scorePercent >= quiz.passingScore;

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-5">
      <h3 className="text-sm font-bold text-slate-900">Quiz — passing score {quiz.passingScore}%</h3>
      {quiz.questions.map((q, qi) => (
        <div key={q.id}>
          <p className="text-sm font-semibold text-slate-800 mb-2">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-1.5">
            {q.options.map((option, oi) => {
              const selected = answers[q.id] === oi;
              const isCorrect = submitted && oi === q.correctOptionIndex;
              const isWrongSelected = submitted && selected && oi !== q.correctOptionIndex;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={`w-full text-left text-sm px-3.5 py-2 rounded-lg border transition ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isWrongSelected
                      ? "border-red-300 bg-red-50 text-red-700"
                      : selected
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.questions.length}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
        >
          Submit Quiz
        </button>
      ) : (
        <div className={`flex items-center gap-2 text-sm font-semibold ${passed ? "text-emerald-600" : "text-red-600"}`}>
          {passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {scorePercent}% — {passed ? "Passed" : "Not quite, review and try again"}
        </div>
      )}
    </div>
  );
}
