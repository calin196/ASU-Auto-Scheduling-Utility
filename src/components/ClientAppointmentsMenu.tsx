"use client";

import { useEffect, useRef, useState } from "react";

type ClientAppointment = {
  id: number;
  serviceType: string;
  category: string | null;
  appointmentDate: Date | string;
  provider: {
    fullName: string;
    email: string;
  };
};

function formatDate(dateValue: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateValue));
}

export default function ClientAppointmentsMenu({
  appointments = [],
}: {
  appointments: ClientAppointment[];
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: "150px",
        left: "18px",
        zIndex: 9998,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open active appointments"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "1px solid #27272a",
          background: "#09090b",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          position: "relative",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.8a3 3 0 0 1 3 3" />
          <path d="M20.36 8.64a3 3 0 0 1-1.1 4.1" />
          <path d="M19.26 17.1a3 3 0 0 1-4.1 1.1" />
          <path d="M8.84 18.2a3 3 0 0 1-4.1-1.1" />
          <path d="M3.64 10.74a3 3 0 0 1 1.1-4.1" />
          <path d="M8.74 3.7a3 3 0 0 1 3-0.9" />
          <circle cx="12" cy="12" r="7.2" />
          <path d="m9.2 12.2 1.9 1.9 3.7-4.1" />
        </svg>

        {appointments.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "999px",
              background: "#22c55e",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 6px",
              border: "2px solid #09090b",
            }}
          >
            {appointments.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            marginTop: "10px",
            width: "400px",
            maxWidth: "calc(100vw - 36px)",
            maxHeight: "70vh",
            overflowY: "auto",
            border: "1px solid #27272a",
            borderRadius: "18px",
            background: "#09090b",
            padding: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              color: "#a1a1aa",
              fontSize: "0.95rem",
              borderBottom: "1px solid #18181b",
              marginBottom: "10px",
            }}
          >
            Active Appointments
          </div>

          {appointments.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                color: "#a1a1aa",
              }}
            >
              No active appointments.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                    background: "#111113",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {appointment.provider.fullName}
                  </h3>

                  <p
                    style={{
                      marginTop: "6px",
                      marginBottom: "0",
                      color: "#a1a1aa",
                      fontSize: "0.9rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {appointment.provider.email}
                  </p>

                  <div
                    style={{
                      marginTop: "12px",
                      color: "#d4d4d8",
                      fontSize: "0.95rem",
                      lineHeight: 1.8,
                    }}
                  >
                    <p style={{ margin: "0 0 6px 0" }}>
                      <strong>Service:</strong> {appointment.serviceType}
                    </p>

                    {appointment.category && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Category:</strong> {appointment.category}
                      </p>
                    )}

                    <p style={{ margin: "0 0 6px 0" }}>
                      <strong>Status:</strong> Confirmed
                    </p>

                    <p style={{ margin: 0 }}>
                      <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}