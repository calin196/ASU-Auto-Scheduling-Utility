import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const userName = cookieStore.get("userName")?.value || "User";

  if (!userRole) {
    redirect("/login");
  }

  const isProvider = userRole === "1";

  let companies: { id: number; fullName: string; email: string }[] = [];

  if (!isProvider) {
    companies = await prisma.user.findMany({
      where: { role: 1 },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });
  }

  return (
    <main className="auth-shell">
      <div className="auth-card" style={{ maxWidth: "1100px" }}>
        <p
          style={{
            margin: 0,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#a5b4fc",
            fontSize: "1rem",
            textAlign: "center",
          }}
        >
          Dashboard
        </p>

        <h1
          style={{
            marginTop: "18px",
            marginBottom: "0",
            fontSize: "3rem",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {isProvider ? "Service Provider account" : "Client account"}
        </h1>

        <p
          style={{
            marginTop: "18px",
            color: "#a1a1aa",
            fontSize: "1.25rem",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Welcome, {userName}.
        </p>

        {isProvider ? (
          <p
            style={{
              marginTop: "12px",
              color: "#a1a1aa",
              fontSize: "1.25rem",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Here you will manage appointments, approve or reject bookings,
            organize your work schedule, and handle your business services.
          </p>
        ) : (
          <>
            <p
              style={{
                marginTop: "12px",
                color: "#a1a1aa",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              Choose a company to view its services and continue with your
              booking.
            </p>

            <div
              style={{
                marginTop: "36px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              {companies.length === 0 ? (
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
                  No registered companies found yet.
                </div>
              ) : (
                companies.map((company) => (
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
        )}
      </div>
    </main>
  );
}