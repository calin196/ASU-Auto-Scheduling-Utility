import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const userName = cookieStore.get("userName")?.value || "User";

  if (!userRole) {
    redirect("/login");
  }

  const isProvider = userRole === "1";

  return (
    <main className="auth-shell">
      <div className="auth-card" style={{ maxWidth: "980px", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#a5b4fc",
            fontSize: "1rem",
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
          }}
        >
          Welcome, {userName}.
        </p>

        <p
          style={{
            marginTop: "12px",
            color: "#a1a1aa",
            fontSize: "1.25rem",
            lineHeight: 1.6,
          }}
        >
          {isProvider
            ? "Here you will manage appointments, approve or reject bookings, organize your work schedule, and handle your business services."
            : "Here you will book services, track your appointments, manage your profile, and follow the status of your requests."}
        </p>
      </div>
    </main>
  );
}