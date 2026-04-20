"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptServiceRequest,
  declineServiceRequest,
  providerRespondToClientDate,
} from "@/app/dashboard/actions";

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

function toDateTimeLocalValue(dateValue: Date | string | null) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getScheduleText(request: ProviderRequest) {
  if (request.status !== "accepted") return null;

  switch (request.scheduleStatus) {
    case "awaiting_client_date":
      return "Waiting for client to choose a date.";
    case "awaiting_provider_response":
      return request.lastDateProposedBy === "client"
        ? "Client proposed a date. You need to answer."
        : "Waiting for provider response.";
    case "awaiting_client_response":
      return "Waiting for client response to your proposed date.";
    case "scheduled":
      return "Appointment date confirmed.";
    default:
      return "No appointment flow started yet.";
  }
}

export default function ProviderRequestCard({
  request,
}: {
  request: ProviderRequest;
}) {
  const router = useRouter();

  const [showOfferBox, setShowOfferBox] = useState(false);
  const [showDateReplyBox, setShowDateReplyBox] = useState(false);

  const [price, setPrice] = useState(
    request.clientCounterPrice !== null
      ? String(request.clientCounterPrice)
      : request.quotedPrice !== null
      ? String(request.quotedPrice)
      : ""
  );

  const [isNegotiable, setIsNegotiable] = useState(request.isNegotiable ?? false);
  const [dateReason, setDateReason] = useState("");
  const [newProposedDate, setNewProposedDate] = useState(
    toDateTimeLocalValue(request.appointmentDate)
  );

  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDecline() {
    setFeedback("");

    startTransition(async () => {
      const result = await declineServiceRequest(request.id);

      if (!result.success) {
        setFeedback(result.error || "Failed to decline request.");
        return;
      }

      router.refresh();
    });
  }

  function handleAcceptSubmit() {
    const parsedPrice = Number(price);

    setFeedback("");

    startTransition(async () => {
      const result = await acceptServiceRequest({
        requestId: request.id,
        quotedPrice: parsedPrice,
        isNegotiable,
      });

      if (!result.success) {
        setFeedback(result.error || "Failed to accept request.");
        return;
      }

      setShowOfferBox(false);
      router.refresh();
    });
  }

  function handleAcceptClientDate() {
    setFeedback("");

    startTransition(async () => {
      const result = await providerRespondToClientDate({
        requestId: request.id,
        accept: true,
      });

      if (!result.success) {
        setFeedback(result.error || "Failed to accept the date.");
        return;
      }

      setShowDateReplyBox(false);
      router.refresh();
    });
  }

  function handleRejectAndProposeNewDate() {
    setFeedback("");

    startTransition(async () => {
      const result = await providerRespondToClientDate({
        requestId: request.id,
        accept: false,
        appointmentDate: newProposedDate,
        reason: dateReason,
      });

      if (!result.success) {
        setFeedback(result.error || "Failed to propose a new date.");
        return;
      }

      setShowDateReplyBox(false);
      router.refresh();
    });
  }

  return (
    <div
      style={{
        border: "1px solid #27272a",
        borderRadius: "20px",
        padding: "24px",
        background: "#09090b",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "white",
        }}
      >
        {request.client.fullName}
      </h2>

      <p
        style={{
          marginTop: "8px",
          marginBottom: "0",
          color: "#a1a1aa",
          fontSize: "0.95rem",
          wordBreak: "break-word",
        }}
      >
        {request.client.email}
      </p>

      <div
        style={{
          marginTop: "18px",
          color: "#d4d4d8",
          fontSize: "0.98rem",
          lineHeight: 1.8,
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Service:</strong> {request.serviceType}
        </p>

        {request.category && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Category:</strong> {request.category}
          </p>
        )}

        {request.exactIssue && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Issue:</strong> {request.exactIssue}
          </p>
        )}

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Status:</strong> {request.status}
        </p>

        {request.quotedPrice !== null && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Last quoted price:</strong> €{request.quotedPrice.toFixed(2)}
          </p>
        )}

        {request.clientCounterPrice !== null && request.status === "pending" && (
          <p style={{ margin: "0 0 8px 0", color: "#86efac" }}>
            <strong>Client counter-offer:</strong> €
            {request.clientCounterPrice.toFixed(2)}
          </p>
        )}

        {request.status === "accepted" && request.isNegotiable !== null && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Negotiable:</strong> {request.isNegotiable ? "Yes" : "No"}
          </p>
        )}

        {request.status === "accepted" && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Appointment flow:</strong> {getScheduleText(request)}
          </p>
        )}

        {request.appointmentDate && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Proposed / confirmed date:</strong>{" "}
            {formatDate(request.appointmentDate)}
          </p>
        )}

        {request.appointmentMessage && (
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Message:</strong> {request.appointmentMessage}
          </p>
        )}

        <p style={{ margin: 0, color: "#a1a1aa" }}>
          <strong>Sent:</strong> {formatDate(request.createdAt)}
        </p>
      </div>

      {feedback && (
        <p
          style={{
            marginTop: "16px",
            color: "#fca5a5",
            fontSize: "0.95rem",
          }}
        >
          {feedback}
        </p>
      )}

      {request.status === "pending" && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setShowOfferBox((prev) => !prev)}
            disabled={isPending}
            style={{
              padding: "12px 18px",
              borderRadius: "14px",
              border: "1px solid white",
              background: "white",
              color: "black",
              fontWeight: 600,
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            Accept
          </button>

          <button
            type="button"
            onClick={handleDecline}
            disabled={isPending}
            style={{
              padding: "12px 18px",
              borderRadius: "14px",
              border: "1px solid #3f3f46",
              background: "transparent",
              color: "#fca5a5",
              fontWeight: 600,
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            Decline
          </button>
        </div>
      )}

      {request.status === "pending" && showOfferBox && (
        <div
          style={{
            marginTop: "18px",
            border: "1px solid #27272a",
            borderRadius: "16px",
            padding: "18px",
            background: "#111113",
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: "14px",
              color: "white",
              fontWeight: 600,
            }}
          >
            Set offer details
          </p>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #3f3f46",
              background: "#0b0b0d",
              color: "white",
              outline: "none",
              marginBottom: "14px",
            }}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#d4d4d8",
              marginBottom: "16px",
            }}
          >
            <input
              type="checkbox"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
            />
            Negotiable
          </label>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleAcceptSubmit}
              disabled={isPending}
              style={{
                padding: "12px 18px",
                borderRadius: "14px",
                border: "1px solid white",
                background: "white",
                color: "black",
                fontWeight: 600,
                cursor: isPending ? "default" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Saving..." : "Save offer"}
            </button>

            <button
              type="button"
              onClick={() => setShowOfferBox(false)}
              disabled={isPending}
              style={{
                padding: "12px 18px",
                borderRadius: "14px",
                border: "1px solid #3f3f46",
                background: "transparent",
                color: "white",
                fontWeight: 600,
                cursor: isPending ? "default" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {request.status === "accepted" &&
        request.scheduleStatus === "awaiting_provider_response" &&
        request.lastDateProposedBy === "client" && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleAcceptClientDate}
              disabled={isPending}
              style={{
                padding: "12px 18px",
                borderRadius: "14px",
                border: "1px solid white",
                background: "white",
                color: "black",
                fontWeight: 600,
                cursor: isPending ? "default" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              Accept date
            </button>

            <button
              type="button"
              onClick={() => setShowDateReplyBox((prev) => !prev)}
              disabled={isPending}
              style={{
                padding: "12px 18px",
                borderRadius: "14px",
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
        )}

      {request.status === "accepted" &&
        request.scheduleStatus === "awaiting_provider_response" &&
        request.lastDateProposedBy === "client" &&
        showDateReplyBox && (
          <div
            style={{
              marginTop: "18px",
              border: "1px solid #27272a",
              borderRadius: "16px",
              padding: "18px",
              background: "#111113",
            }}
          >
            <p
              style={{
                marginTop: 0,
                marginBottom: "14px",
                color: "white",
                fontWeight: 600,
              }}
            >
              Reject current date and propose a new one
            </p>

            <textarea
              value={dateReason}
              onChange={(e) => setDateReason(e.target.value)}
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
                marginBottom: "14px",
                resize: "vertical",
              }}
            />

            <input
              type="datetime-local"
              value={newProposedDate}
              onChange={(e) => setNewProposedDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #3f3f46",
                background: "#0b0b0d",
                color: "white",
                outline: "none",
                marginBottom: "14px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleRejectAndProposeNewDate}
                disabled={isPending}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
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

              <button
                type="button"
                onClick={() => setShowDateReplyBox(false)}
                disabled={isPending}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "1px solid #3f3f46",
                  background: "transparent",
                  color: "white",
                  fontWeight: 600,
                  cursor: isPending ? "default" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
