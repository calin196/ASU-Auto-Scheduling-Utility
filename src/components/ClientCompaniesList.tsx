"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Company = {
  id: number;
  fullName: string;
  email: string;
};

export default function ClientCompaniesList({
  companies,
}: {
  companies: Company[];
}) {
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return companies;

    return companies.filter((company) => {
      return (
        company.fullName.toLowerCase().includes(value) ||
        company.email.toLowerCase().includes(value)
      );
    });
  }, [companies, search]);

  return (
    <>
      <div
        style={{
          marginTop: "28px",
          marginBottom: "8px",
        }}
      >
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "14px",
            border: "1px solid #27272a",
            background: "#09090b",
            color: "white",
            outline: "none",
            fontSize: "1rem",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredCompanies.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              border: "1px solid #27272a",
              borderRadius: "20px",
              padding: "24px",
              background: "#09090b",
              textAlign: "center",
              color: "#a1a1aa",
            }}
          >
            No companies found.
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
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
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {company.fullName}
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  marginBottom: "20px",
                  color: "#a1a1aa",
                  fontSize: "0.95rem",
                  wordBreak: "break-word",
                }}
              >
                {company.email}
              </p>

              <Link
                href={`/companies/${company.id}`}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid white",
                  background: "white",
                  color: "black",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                View services
              </Link>
            </div>
          ))
        )}
      </div>
    </>
  );
}