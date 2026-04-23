"use client";

import { useEffect, useRef, useState } from "react";
import { logoutUser } from "@/app/dashboard/actions";

export default function AccountMenu() {
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
      className="floating-menu account-menu"
      style={{
        position: "fixed",
        top: "18px",
        left: "18px",
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open settings menu"
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
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.1a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.16.06.33.09.51.09H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      </button>

      {open && (
        <div
          className="floating-panel"
          style={{
            marginTop: "10px",
            minWidth: "190px",
            border: "1px solid #27272a",
            borderRadius: "16px",
            background: "#09090b",
            padding: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              color: "#a1a1aa",
              fontSize: "0.9rem",
              borderBottom: "1px solid #18181b",
              marginBottom: "8px",
            }}
          >
            Account
          </div>

          <form action={logoutUser}>
            <button
              type="submit"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #27272a",
                background: "#111113",
                color: "#fca5a5",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}