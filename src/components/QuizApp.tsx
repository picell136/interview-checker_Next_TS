"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { pickQuizQuestions, QUESTIONS_BY_TOPIC, QUIZ_LENGTH } from "@/data/questions";
import type { QuizQuestion, Topic } from "@/types/quiz";

const TIMER_SECONDS = 60;
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

type QuizStatus = "idle" | "answering" | "revealed" | "finished";

type QuizAppProps = {
  topic: Topic;
};

export function QuizApp({ topic }: QuizAppProps) {
  const bank = QUESTIONS_BY_TOPIC[topic.id];
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);

  const startQuiz = useCallback(() => {
    setQueue(pickQuizQuestions(bank, QUIZ_LENGTH));
    setIndex(0);
    setStatus("answering");
    setSelected(null);
    setTimedOut(false);
    setSecondsLeft(TIMER_SECONDS);
    setScore(0);
  }, [bank]);

  const question = queue[index];
  const progress = queue.length === 0 ? 0 : Math.round((index / queue.length) * 100);
  const timerRatio = secondsLeft / TIMER_SECONDS;

  const reveal = useCallback(
    (choice: number | null) => {
      if (status !== "answering" || !question) {
        return;
      }

      const isTimeout = choice === null;
      const isCorrect = choice === question.correctIndex;
      setTimedOut(isTimeout);
      setSelected(choice);
      setStatus("revealed");
      if (isCorrect) {
        setScore((value) => value + 1);
      }
    },
    [question, status],
  );

  useEffect(() => {
    if (status !== "answering") {
      return;
    }

    setSecondsLeft(TIMER_SECONDS);
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status, index]);

  useEffect(() => {
    if (status === "answering" && secondsLeft === 0) {
      reveal(null);
    }
  }, [reveal, secondsLeft, status]);

  const goNext = () => {
    if (index + 1 >= queue.length) {
      setStatus("finished");
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setTimedOut(false);
    setSecondsLeft(TIMER_SECONDS);
    setStatus("answering");
  };

  const resultTitle = useMemo(() => {
    if (queue.length === 0) {
      return "";
    }
    const ratio = score / queue.length;
    if (ratio === 1) {
      return "Идеально";
    }
    if (ratio >= 0.7) {
      return "Сильный результат";
    }
    if (ratio >= 0.4) {
      return "Есть база, но стоит повторить материал";
    }
    return "Повторите материал и пройдите ещё раз";
  }, [queue.length, score]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
          ← К технологиям
        </Link>
        <a
          href={topic.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-500 hover:text-slate-300"
        >
          Темы вопросов
        </a>
      </div>

      {status === "idle" ? (
        <section className="rounded-3xl border border-white/10 bg-[#12182b]/80 p-8">
          <p className="text-sm font-medium" style={{ color: topic.accent }}>
            Викторина
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">{topic.title}</h1>
          <p className="mt-4 max-w-xl text-slate-400">{topic.subtitle}. На каждый вопрос — 60 секунд. После ответа появится разбор.</p>
          <p className="mt-3 text-sm text-slate-500">
            В викторине {QUIZ_LENGTH} случайных вопросов из {bank.length}, без повторов
          </p>
          <button
            type="button"
            onClick={startQuiz}
            className="mt-8 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: topic.accent }}
          >
            Начать
          </button>
        </section>
      ) : null}

      {status === "answering" || status === "revealed" ? (
        <section className="rounded-3xl border border-white/10 bg-[#12182b]/80 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 text-sm text-slate-400">
            <span>
              Вопрос {index + 1} из {queue.length}
            </span>
            <span className="option-letter font-medium text-white">
              {secondsLeft}s
            </span>
          </div>

          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{
                width: `${timerRatio * 100}%`,
                backgroundColor: secondsLeft <= 10 ? "#fb7185" : topic.accent,
              }}
            />
          </div>
          <div className="mb-8 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-white/25" style={{ width: `${progress}%` }} />
          </div>

          <h1 className="text-2xl font-semibold leading-snug text-white sm:text-3xl">{question?.prompt}</h1>

          <ul className="mt-8 space-y-3">
            {question?.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              const isSelected = selected === optionIndex;
              const showSolution = status === "revealed";

              let className =
                "flex w-full items-start gap-4 rounded-2xl border-2 bg-white/3 px-4 py-4 text-left transition";
              if (!showSolution) {
                className += " border-white/10 hover:border-white/25 hover:bg-white/6";
              } else if (isCorrect) {
                className += " border-emerald-500 bg-emerald-500/10";
              } else if (isSelected) {
                className += " border-rose-500 bg-rose-500/10";
              } else {
                className += " border-white/10 opacity-70";
              }

              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={showSolution}
                    onClick={() => reveal(optionIndex)}
                    className={className}
                  >
                    <span className="option-letter mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-slate-200">
                      {OPTION_LETTERS[optionIndex]}
                    </span>
                    <span className="text-base leading-6 text-slate-100">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {status === "revealed" && question ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-white">
                {timedOut
                  ? "Время вышло"
                  : selected === question.correctIndex
                    ? "Верно"
                    : "Неверно"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{question.explanation}</p>
              <button
                type="button"
                onClick={goNext}
                className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
              >
                {index + 1 >= queue.length ? "К результату" : "Следующий вопрос"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {status === "finished" ? (
        <section className="rounded-3xl border border-white/10 bg-[#12182b]/80 p-8">
          <p className="text-sm font-medium" style={{ color: topic.accent }}>
            {topic.title}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">{resultTitle}</h1>
          <p className="mt-4 text-lg text-slate-300">
            {score} из {queue.length} правильных ответов
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startQuiz}
              className="rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950"
              style={{ backgroundColor: topic.accent }}
            >
              Пройти ещё раз
            </button>
            <Link href="/" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white">
              На главную
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
