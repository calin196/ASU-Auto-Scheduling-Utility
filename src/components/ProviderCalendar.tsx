"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import ProviderRequestCard from "@/components/ProviderRequestCard";
import styles from "./ProviderCalendar.module.css";

type ProviderRequest = {
  id: number;
  serviceType: string;
  category: string | null;
  exactIssue: string | null;
  status: string;
  quotedPrice: number | null;
  isNegotiable: boolean | null;
  clientCounterPrice: number | null;
  scheduleStatus: string;
  appointmentDate: Date | string | null;
  appointmentMessage: string | null;
  lastDateProposedBy: string | null;
  createdAt: Date | string;
  client: {
    fullName: string;
    email: string;
  };
};

type CalendarRequest = ProviderRequest & {
  parsedAppointmentDate: Date;
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSelectedDayTitle(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function buildMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = firstDay.getDay();

  const cells: Array<Date | null> = [];

  for (let i = 0; i < leadingEmpty; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function ProviderCalendar({
  requests,
}: {
  requests: ProviderRequest[];
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(today));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(today));

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? 0;
    const endY = event.changedTouches[0]?.clientY ?? 0;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    const isHorizontalSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontalSwipe) {
      if (deltaX < 0) {
        changeMonth(1);
      } else {
        changeMonth(-1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
        setShowYearPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const requestsWithDates = useMemo<CalendarRequest[]>(() => {
    return requests
      .filter((request) => request.appointmentDate !== null)
      .map((request) => ({
        ...request,
        parsedAppointmentDate: new Date(request.appointmentDate as string | Date),
      }))
      .filter(
        (request) => !Number.isNaN(request.parsedAppointmentDate.getTime())
      )
      .sort(
        (a, b) =>
          a.parsedAppointmentDate.getTime() - b.parsedAppointmentDate.getTime()
      );
  }, [requests]);

  const requestsByDay = useMemo(() => {
    const map = new Map<string, CalendarRequest[]>();

    for (const request of requestsWithDates) {
      const key = toDateKey(request.parsedAppointmentDate);

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(request);
    }

    return map;
  }, [requestsWithDates]);

  const selectedDate = useMemo(() => {
    const [year, month, day] = selectedDateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDateKey]);

  const selectedRequests = requestsByDay.get(selectedDateKey) || [];
  const cells = buildMonthCells(currentMonth);
  const todayKey = toDateKey(today);

  function changeMonth(offset: number) {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + offset,
      1
    );

    setCurrentMonth(nextMonth);
    setSelectedDateKey(toDateKey(nextMonth));
  }

  function jumpToMonth(monthIndex: number) {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newDate);
    setSelectedDateKey(toDateKey(newDate));
    setShowMonthPicker(false);
  }

  function jumpToYear(year: number) {
    const newDate = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
    setSelectedDateKey(toDateKey(newDate));
    setShowYearPicker(false);
  }

  const yearOptions = Array.from({ length: 21 }, (_, i) => {
    return new Date().getFullYear() - 5 + i;
  });

  return (
    <div className={styles.calendarWrapper}>
      <div
        className={styles.calendarBox}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.topBar}>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className={styles.navButton}
          >
            Previous
          </button>

          <div ref={pickerRef} className={styles.titleArea}>
            <button
              type="button"
              onClick={() => {
                setShowMonthPicker((prev) => !prev);
                setShowYearPicker(false);
              }}
              className={styles.titleButton}
            >
              {MONTHS[currentMonth.getMonth()]}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowYearPicker((prev) => !prev);
                setShowMonthPicker(false);
              }}
              className={styles.titleButton}
            >
              {currentMonth.getFullYear()}
            </button>

            {showMonthPicker && (
              <div className={styles.pickerMonth}>
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => jumpToMonth(index)}
                    className={`${styles.pickerButton} ${
                      index === currentMonth.getMonth()
                        ? styles.pickerButtonActive
                        : ""
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

            {showYearPicker && (
              <div className={styles.pickerYear}>
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => jumpToYear(year)}
                    className={`${styles.pickerButton} ${
                      year === currentMonth.getFullYear()
                        ? styles.pickerButtonActive
                        : ""
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className={styles.navButton}
          >
            Next
          </button>
        </div>

        <div className={styles.weekdaysGrid}>
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className={styles.weekday}>
              {weekday}
            </div>
          ))}

          {cells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className={styles.dayCellEmpty} />;
            }

            const key = toDateKey(cell);
            const dayRequests = requestsByDay.get(key) || [];
            const isSelected = key === selectedDateKey;
            const isToday = key === todayKey;

            const classNames = [styles.dayCell];
            if (isSelected) classNames.push(styles.dayCellSelected);
            else if (isToday) classNames.push(styles.dayCellToday);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDateKey(key)}
                className={classNames.join(" ")}
              >
                <div className={styles.dayNumber}>{cell.getDate()}</div>

                {dayRequests.length > 0 && (
                  <div className={styles.dayBadge}>{dayRequests.length}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.appointmentsBox}>
        <h3 className={styles.appointmentsTitle}>
          Appointments for {formatSelectedDayTitle(selectedDate)}
        </h3>

        {selectedRequests.length === 0 ? (
          <div className={styles.emptyAppointments}>
            No appointments on this day.
          </div>
        ) : (
          <div className={styles.appointmentsGrid}>
            {selectedRequests.map((request) => (
              <ProviderRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}