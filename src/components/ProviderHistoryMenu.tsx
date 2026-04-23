"use client";

import { useEffect, useRef, useState } from "react";
import ProviderRequestCard from "@/components/ProviderRequestCard";

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

export default function ProviderHistoryMenu({
  requests,
}: {
  requests: ProviderRequest[];
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const pendingCount = requests.filter((request) => request.status === "pending").length;

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
      className="floating-menu history-menu"
      style={{
        position: "fixed",
        top: "84px",
        left: "18px",
        zIndex: 9998,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open provider history"
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
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l3 3" />
        </svg>

        {pendingCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "999px",
              background: "#ef4444",
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
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="floating-panel"
          style={{
            marginTop: "10px",
            width: "460px",
            maxWidth: "calc(100vw - 36px)",
            maxHeight: "78vh",
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
            History / All Requests
          </div>

          {requests.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                color: "#a1a1aa",
              }}
            >
              No requests yet.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {requests.map((request) => (
                <ProviderRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}