"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  clientRespondToProviderDate,
  markClientMessagesRead,
  proposeAppointmentDateByClient,
  sendCounterOffer,
} from "@/app/dashboard/actions";

type ClientRequest = {
  id: number;
  serviceType: string;
  category: string | null;
  exactIssue: string | null;
  status: string;
  quotedPrice: number | null;
  isNegotiable: boolean | null;
  clientCounterPrice: number | null;
  unreadForClient: boolean;
  scheduleStatus: string;
  appointmentDate: Date | string | null;
  appointmentMessage: string | null;
  lastDateProposedBy: string | null;
  createdAt: Date | string;
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
    second: "2-digit",
    hour12: false,
  }).format(new Date(dateValue));
}

function getScheduleText(request: ClientRequest) {
  if (request.status !== "accepted") return null;

  switch (request.scheduleStatus) {
    case "awaiting_client_date":
      return "Provider accepted the service. Choose your preferred date.";
    case "awaiting_provider_response":
      return request.lastDateProposedBy === "client"
        ? "Waiting for provider response to your date."
        : "Waiting for provider response.";
    case "awaiting_client_response":
      return "Provider proposed a new date. Accept it or propose another one.";
    case "scheduled":
      return "Appointment date confirmed.";
    default:
      return "No appointment flow started yet.";
  }
}

export default function ClientMessagesMenu({
  requests,
  unreadCount,
}: {
  requests: ClientRequest[];
  unreadCount: number;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [counterValues, setCounterValues] = useState<Record<number, string>>({});
  const [dateValues, setDateValues] = useState<Record<number, string>>({});
  const [showDateReplyBox, setShowDateReplyBox] = useState<
    Record<number, boolean>
  >({});
  const [replyReasons, setReplyReasons] = useState<Record<number, string>>({});
  const [replyDates, setReplyDates] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<
    Record<number, { text: string; success: boolean }>
  >({});

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

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      startTransition(async () => {
        await markClientMessagesRead();
        router.refresh();
      });
    }
  }

  function handleCounterSend(requestId: number) {
    const value = Number(counterValues[requestId] || "");

    setFeedback((prev) => ({
      ...prev,
      [requestId]: { text: "", success: false },
    }));

    startTransition(async () => {
      const result = await sendCounterOffer({
        requestId,
        counterPrice: value,
      });

      if (!result.success) {
        setFeedback((prev) => ({
          ...prev,
          [requestId]: {
            text: result.error || "Failed to send counter-offer.",
            success: false,
          },
        }));
        return;
      }

      setFeedback((prev) => ({
        ...prev,
        [requestId]: {
          text: result.message || "Counter-offer sent.",
          success: true,
        },
      }));

      router.refresh();
    });
  }

  function handleInitialDateSend(requestId: number) {
    const appointmentDate = dateValues[requestId] || "";

    setFeedback((prev) => ({
      ...prev,
      [requestId]: { text: "", success: false },
    }));

    startTransition(async () => {
      const result = await proposeAppointmentDateByClient({
        requestId,
        appointmentDate,
      });

      if (!result.success) {
        setFeedback((prev) => ({
          ...prev,
          [requestId]: {
            text: result.error || "Failed to send date.",
            success: false,
          },
        }));
        return;
      }

      setFeedback((prev) => ({
        ...prev,
        [requestId]: {
          text: result.message || "Date sent.",
          success: true,
        },
      }));

      router.refresh();
    });
  }

  function handleAcceptProviderDate(requestId: number) {
    setFeedback((prev) => ({
      ...prev,
      [requestId]: { text: "", success: false },
    }));

    startTransition(async () => {
      const result = await clientRespondToProviderDate({
        requestId,
        accept: true,
      });

      if (!result.success) {
        setFeedback((prev) => ({
          ...prev,
          [requestId]: {
            text: result.error || "Failed to accept date.",
            success: false,
          },
        }));
        return;
      }

      setFeedback((prev) => ({
        ...prev,
        [requestId]: {
          text: result.message || "Appointment confirmed.",
          success: true,
        },
      }));

      router.refresh();
    });
  }

  function handleRejectProviderDate(requestId: number) {
    const reason = replyReasons[requestId] || "";
    const appointmentDate = replyDates[requestId] || "";

    setFeedback((prev) => ({
      ...prev,
      [requestId]: { text: "", success: false },
    }));

    startTransition(async () => {
      const result = await clientRespondToProviderDate({
        requestId,
        accept: false,
        appointmentDate,
        reason,
      });

      if (!result.success) {
        setFeedback((prev) => ({
          ...prev,
          [requestId]: {
            text: result.error || "Failed to send new date.",
            success: false,
          },
        }));
        return;
      }

      setFeedback((prev) => ({
        ...prev,
        [requestId]: {
          text: result.message || "New date sent.",
          success: true,
        },
      }));

      setShowDateReplyBox((prev) => ({
        ...prev,
        [requestId]: false,
      }));

      router.refresh();
    });
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: "84px",
        left: "18px",
        zIndex: 9998,
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open messages"
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
          <path d="M4 4h16v12H4z" />
          <path d="m22 6-10 7L2 6" />
        </svg>

        {unreadCount > 0 && (
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
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            marginTop: "10px",
            width: "420px",
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
            Messages / Offers
          </div>

          {requests.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                color: "#a1a1aa",
              }}
            >
              No messages yet.
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
                <div
                  key={request.id}
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
                    {request.provider.fullName}
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
                    {request.provider.email}
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
                      <strong>Service:</strong> {request.serviceType}
                    </p>

                    {request.category && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Category:</strong> {request.category}
                      </p>
                    )}

                    <p style={{ margin: "0 0 6px 0" }}>
                      <strong>Status:</strong> {request.status}
                    </p>

                    {request.quotedPrice !== null && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Price:</strong> €{request.quotedPrice.toFixed(2)}
                      </p>
                    )}

                    {request.isNegotiable !== null && request.status === "accepted" && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Negotiable:</strong>{" "}
                        {request.isNegotiable ? "Yes" : "No"}
                      </p>
                    )}

                    {request.status === "accepted" && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Appointment flow:</strong> {getScheduleText(request)}
                      </p>
                    )}

                    {request.appointmentDate && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Proposed / confirmed date:</strong>{" "}
                        {formatDate(request.appointmentDate)}
                      </p>
                    )}

                    {request.appointmentMessage && (
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Message:</strong> {request.appointmentMessage}
                      </p>
                    )}

                    {request.status === "pending" &&
                      request.clientCounterPrice !== null && (
                        <p style={{ margin: "0 0 6px 0", color: "#86efac" }}>
                          <strong>Your counter-offer:</strong> €
                          {request.clientCounterPrice.toFixed(2)}
                        </p>
                      )}

                    {request.status === "pending" &&
                      request.clientCounterPrice === null && (
                        <p style={{ margin: "0 0 6px 0", color: "#a1a1aa" }}>
                          Waiting for provider response.
                        </p>
                      )}

                    <p style={{ margin: 0, color: "#a1a1aa" }}>
                      <strong>Sent:</strong> {formatDate(request.createdAt)}
                    </p>
                  </div>

                  {feedback[request.id]?.text && (
                    <p
                      style={{
                        marginTop: "12px",
                        color: feedback[request.id].success
                          ? "#86efac"
                          : "#fca5a5",
                        fontSize: "0.92rem",
                      }}
                    >
                      {feedback[request.id].text}
                    </p>
                  )}

                  {request.status === "accepted" &&
                    request.isNegotiable &&
                    request.scheduleStatus === "awaiting_client_date" && (
                      <div
                        style={{
                          marginTop: "14px",
                          borderTop: "1px solid #27272a",
                          paddingTop: "14px",
                        }}
                      >
                        <p
                          style={{
                            marginTop: 0,
                            marginBottom: "10px",
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          Send your price
                        </p>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Your counter price"
                          value={counterValues[request.id] || ""}
                          onChange={(e) =>
                            setCounterValues((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: "1px solid #3f3f46",
                            background: "#0b0b0d",
                            color: "white",
                            outline: "none",
                            marginBottom: "12px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleCounterSend(request.id)}
                          disabled={isPending}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid white",
                            background: "white",
                            color: "black",
                            fontWeight: 600,
                            cursor: isPending ? "default" : "pointer",
                            opacity: isPending ? 0.7 : 1,
                          }}
                        >
                          {isPending ? "Sending..." : "Send counter-offer"}
                        </button>
                      </div>
                    )}

                  {request.status === "accepted" &&
                    request.scheduleStatus === "awaiting_client_date" && (
                      <div
                        style={{
                          marginTop: "14px",
                          borderTop: "1px solid #27272a",
                          paddingTop: "14px",
                        }}
                      >
                        <p
                          style={{
                            marginTop: 0,
                            marginBottom: "10px",
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          Choose your preferred date
                        </p>

                        <input
                          type="datetime-local"
                          value={dateValues[request.id] || ""}
                          onChange={(e) =>
                            setDateValues((prev) => ({
                              ...prev,
                              [request.id]: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: "1px solid #3f3f46",
                            background: "#0b0b0d",
                            color: "white",
                            outline: "none",
                            marginBottom: "12px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => handleInitialDateSend(request.id)}
                          disabled={isPending}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid white",
                            background: "white",
                            color: "black",
                            fontWeight: 600,
                            cursor: isPending ? "default" : "pointer",
                            opacity: isPending ? 0.7 : 1,
                          }}
                        >
                          {isPending ? "Sending..." : "Send date"}
                        </button>
                      </div>
                    )}

                  {request.status === "accepted" &&
                    request.scheduleStatus === "awaiting_client_response" &&
                    request.lastDateProposedBy === "provider" && (
                      <div
                        style={{
                          marginTop: "14px",
                          borderTop: "1px solid #27272a",
                          paddingTop: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleAcceptProviderDate(request.id)}
                            disabled={isPending}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "1px solid white",
                              background: "white",
                              color: "black",
                              fontWeight: 600,
                              cursor: isPending ? "default" : "pointer",
                              opacity: isPending ? 0.7 : 1,
                            }}
                          >
                            {isPending ? "Saving..." : "Accept date"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setShowDateReplyBox((prev) => ({
                                ...prev,
                                [request.id]: !prev[request.id],
                              }))
                            }
                            disabled={isPending}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "1px solid #3f3f46",
                              background: "transparent",
                              color: "white",
                              fontWeight: 600,
                              cursor: isPending ? "default" : "pointer",
                              opacity: isPending ? 0.7 : 1,
                            }}
                          >
                            Reject and propose new date
                          </button>
                        </div>

                        {showDateReplyBox[request.id] && (
                          <div
                            style={{
                              marginTop: "12px",
                            }}
                          >
                            <textarea
                              value={replyReasons[request.id] || ""}
                              onChange={(e) =>
                                setReplyReasons((prev) => ({
                                  ...prev,
                                  [request.id]: e.target.value,
                                }))
                              }
                              placeholder="Write the reason"
                              rows={4}
                              style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "12px",
                                border: "1px solid #3f3f46",
                                background: "#0b0b0d",
                                color: "white",
                                outline: "none",
                                marginBottom: "12px",
                                resize: "vertical",
                              }}
                            />

                            <input
                              type="datetime-local"
                              value={replyDates[request.id] || ""}
                              onChange={(e) =>
                                setReplyDates((prev) => ({
                                  ...prev,
                                  [request.id]: e.target.value,
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "12px 14px",
                                borderRadius: "12px",
                                border: "1px solid #3f3f46",
                                background: "#0b0b0d",
                                color: "white",
                                outline: "none",
                                marginBottom: "12px",
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => handleRejectProviderDate(request.id)}
                              disabled={isPending}
                              style={{
                                padding: "12px 16px",
                                borderRadius: "12px",
                                border: "1px solid white",
                                background: "white",
                                color: "black",
                                fontWeight: 600,
                                cursor: isPending ? "default" : "pointer",
                                opacity: isPending ? 0.7 : 1,
                              }}
                            >
                              {isPending ? "Sending..." : "Send new date"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}