import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AccountMenu from "@/components/AccountMenu";
import ClientMessagesMenu from "@/components/ClientMessagesMenu";
import ClientAppointmentsMenu from "@/components/ClientAppointmentsMenu";
import ProviderCalendar from "@/components/ProviderCalendar";
import ProviderHistoryMenu from "@/components/ProviderHistoryMenu";

type Company = {
  id: number;
  fullName: string;
  email: string;
};

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const userName = cookieStore.get("userName")?.value || "User";
  const userId = Number(cookieStore.get("userId")?.value);

  if (!userRole || !userId) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const searchQuery = (resolvedSearchParams?.q || "").trim();

  const isProvider = userRole === "1";

  const companies: Company[] = !isProvider
    ? await prisma.user.findMany({
        where: searchQuery
          ? {
              role: 1,
              OR: [
                {
                  fullName: {
                    contains: searchQuery,
                  },
                },
                {
                  email: {
                    contains: searchQuery,
                  },
                },
              ],
            }
          : { role: 1 },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
        orderBy: {
          fullName: "asc",
        },
      })
    : [];

  const providerRequests: ProviderRequest[] = isProvider
    ? await prisma.serviceRequest.findMany({
        where: {
          providerId: userId,
        },
        select: {
          id: true,
          serviceType: true,
          category: true,
          exactIssue: true,
          status: true,
          quotedPrice: true,
          isNegotiable: true,
          clientCounterPrice: true,
          scheduleStatus: true,
          appointmentDate: true,
          appointmentMessage: true,
          lastDateProposedBy: true,
          createdAt: true,
          client: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const clientRequests: ClientRequest[] = !isProvider
    ? await prisma.serviceRequest.findMany({
        where: {
          clientId: userId,
        },
        select: {
          id: true,
          serviceType: true,
          category: true,
          exactIssue: true,
          status: true,
          quotedPrice: true,
          isNegotiable: true,
          clientCounterPrice: true,
          unreadForClient: true,
          scheduleStatus: true,
          appointmentDate: true,
          appointmentMessage: true,
          lastDateProposedBy: true,
          createdAt: true,
          provider: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const activeAppointments: ClientAppointment[] = !isProvider
    ? (await prisma.serviceRequest.findMany({
        where: {
          clientId: userId,
          status: "accepted",
          scheduleStatus: "scheduled",
          appointmentDate: {
            not: null,
            gte: new Date(),
          },
        },
        select: {
          id: true,
          serviceType: true,
          category: true,
          appointmentDate: true,
          provider: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      })) as ClientAppointment[]
    : [];

  const unreadClientCount = !isProvider
    ? clientRequests.filter((request) => request.unreadForClient).length
    : 0;

  return (
    <main className="auth-shell dashboard-shell">
      <div
        className="auth-card dashboard-card"
        style={{ maxWidth: isProvider ? "1180px" : "1100px", position: "relative" }}
      >
        <AccountMenu />

        {isProvider ? (
          <ProviderHistoryMenu requests={providerRequests} />
        ) : (
          <>
            <ClientMessagesMenu
              requests={clientRequests}
              unreadCount={unreadClientCount}
            />
            <ClientAppointmentsMenu appointments={activeAppointments} />
          </>
        )}

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
              Use the calendar to manage appointments. Open history to see all
              requests in the old card view.
            </p>

            <ProviderCalendar requests={providerRequests} />
          </>
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
              Choose one company or send the same request to all companies at once.
            </p>

            <form
              method="GET"
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 14px",
                  height: "46px",
                  borderRadius: "14px",
                  border: "1px solid #27272a",
                  background: "#09090b",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a1a1aa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>

                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search companies..."
                  style={{
                    flex: 1,
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "white",
                    fontSize: "0.95rem",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    padding: "7px 12px",
                    borderRadius: "10px",
                    border: "1px solid #3f3f46",
                    background: "transparent",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    flexShrink: 0,
                  }}
                >
                  Go
                </button>
              </div>
            </form>

            {searchQuery && (
              <div
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                }}
              >
                <Link
                  href="/dashboard"
                  style={{
                    color: "#a1a1aa",
                    fontSize: "0.92rem",
                    textDecoration: "none",
                  }}
                >
                  Clear search
                </Link>
              </div>
            )}

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
                <>
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
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      All companies
                    </h2>

                    <p
                      style={{
                        marginTop: "10px",
                        marginBottom: "20px",
                        color: "#a1a1aa",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Fill the request once and send it to every registered company.
                    </p>

                    <Link
                      href="/companies/all"
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
                      Apply to all companies
                    </Link>
                  </div>

                  {companies.map((company) => (
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
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}