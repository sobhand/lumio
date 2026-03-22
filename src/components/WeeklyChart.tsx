"use client";

import { format, parseISO } from "date-fns";

interface DayData {
  date: string;
  completed: number;
  total: number;
}

export function WeeklyChart({ data }: { data: DayData[] }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-28 px-1">
      {data.map((day) => {
        const ratio = day.total > 0 ? day.completed / day.total : 0;
        const height = Math.max((day.total / maxTotal) * 100, 8);
        const isToday = day.date === today;
        const dayLabel = format(parseISO(day.date), "EEE").charAt(0);

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
              <div
                className={`w-full max-w-[32px] rounded-lg transition-all duration-500 ${
                  ratio === 1
                    ? "bg-success"
                    : ratio > 0
                    ? "bg-primary/60"
                    : "bg-warm-gray/15"
                } ${isToday ? "ring-2 ring-primary/30" : ""}`}
                style={{ height: `${height * ratio || 4}%`, minHeight: "4px" }}
              />
            </div>
            <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-warm-gray"}`}>
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
