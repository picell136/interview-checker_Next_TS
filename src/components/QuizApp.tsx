"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveQuizResultAction } from "@/app/actions/results";
import { pickQuizQuestions, QUESTIONS_BY_TOPIC, QUIZ_LENGTH } from "@/data/questions";
import { formatResultDate, getResultHeadline } from "@/lib/quiz-result";
import type { LastQuizResult } from "@/lib/quiz-result";
import type { QuizQuestion, Topic } from "@/types/quiz";

const TIMER_SECONDS = 60;
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

type QuizStatus = "idle" | "answering" | "revealed" | "finished";

type QuizAppProps = {
  topic: Topic;
  lastResult: LastQuizResult | null;
};

export function QuizApp({ topic, lastResult }: QuizAppProps) {
  const bank = QUESTIONS_BY_TOPIC[topic.id];
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const savedAttempt = useRef(false);

  const startQuiz = useCallback(() => {
    savedAttempt.current = false;
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

  useEffect(() => {
    if (status !== "finished" || savedAttempt.current || queue.length === 0) {
      return;
    }
    savedAttempt.current = true;
    void saveQuizResultAction({
      topicId: topic.id,
      topicTitle: topic.title,
      score,
      total: queue.length,
    });
  }, [queue.length, score, status, topic.id, topic.title]);

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

  const resultTitle = useMemo(() => getResultHeadline(score, queue.length), [queue.length, score]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-muted transition hover:text-fg">
          ← К технологиям
        </Link>
        <a
          href={topic.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-2 hover:text-muted"
        >
          Темы вопросов
        </a>
      </div>

      {status === "idle" ? (
        <section className="rounded-3xl border border-line bg-card p-8">
          <p className="text-sm font-medium" style={{ color: topic.accent }}>
            Викторина
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-fg">{topic.title}</h1>
          <p className="mt-4 max-w-xl text-muted">
            {topic.subtitle}. На каждый вопрос — 60 секунд. После ответа появится разбор.
          </p>
          <p className="mt-3 text-sm text-muted-2">
            В викторине {QUIZ_LENGTH} случайных вопросов из {bank.length}, без повторов
          </p>
          {lastResult ? (
            <p className="mt-4 rounded-2xl border border-line bg-input px-4 py-3 text-sm text-muted">
              Последний результат:{" "}
              <span className="font-semibold text-fg">
                {lastResult.score} из {lastResult.total}
              </span>
              {" · "}
              {formatResultDate(lastResult.finishedAt)}
            </p>
          ) : null}
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
        <section className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 text-sm text-muted">
            <span>
              Вопрос {index + 1} из {queue.length}
            </span>
            <span className="option-letter font-medium text-fg">{secondsLeft}s</span>
          </div>

          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-input">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-linear"
              style={{
                width: `${timerRatio * 100}%`,
                backgroundColor: secondsLeft <= 10 ? "#fb7185" : topic.accent,
              }}
            />
          </div>
          <div className="mb-8 h-1 overflow-hidden rounded-full bg-input">
            <div className="h-full bg-muted-2/40" style={{ width: `${progress}%` }} />
          </div>

          <h1 className="text-2xl font-semibold leading-snug text-fg sm:text-3xl">{question?.prompt}</h1>

          <ul className="mt-8 space-y-3">
            {question?.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              const isSelected = selected === optionIndex;
              const showSolution = status === "revealed";

              let className =
                "flex w-full items-start gap-4 rounded-2xl border-2 bg-input/60 px-4 py-4 text-left transition";
              if (!showSolution) {
                className += " border-line hover:border-muted-2";
              } else if (isCorrect) {
                className += " border-emerald-500 bg-emerald-500/10";
              } else if (isSelected) {
                className += " border-rose-500 bg-rose-500/10";
              } else {
                className += " border-line opacity-70";
              }

              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={showSolution}
                    onClick={() => reveal(optionIndex)}
                    className={className}
                  >
                    <span className="option-letter mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-input text-sm font-semibold text-fg">
                      {OPTION_LETTERS[optionIndex]}
                    </span>
                    <span className="text-base leading-6 text-fg">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {status === "revealed" && question ? (
            <div className="mt-8 rounded-2xl border border-line bg-input p-5">
              <p className="text-sm font-medium text-fg">
                {timedOut
                  ? "Время вышло"
                  : selected === question.correctIndex
                    ? "Верно"
                    : "Неверно"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{question.explanation}</p>
              <button
                type="button"
                onClick={goNext}
                className="mt-5 rounded-2xl bg-btn px-5 py-3 text-sm font-semibold text-btn-fg"
              >
                {index + 1 >= queue.length ? "К результату" : "Следующий вопрос"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {status === "finished" ? (
        <section className="rounded-3xl border border-line bg-card p-8">
          <p className="text-sm font-medium" style={{ color: topic.accent }}>
            {topic.title}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-fg">{resultTitle}</h1>
          <p className="mt-4 text-lg text-muted">
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
            <Link href="/results" className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-fg">
              Все результаты
            </Link>
            <Link href="/" className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-fg">
              На главную
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
