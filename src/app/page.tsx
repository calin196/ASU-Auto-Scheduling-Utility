import Link from "next/link";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(30,41,90,0.35), transparent 35%), #000000",
        color: "white",
      }}
    >
      <section className={styles.homeSection}>
        <div>
          <p
            style={{
              margin: 0,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#a5b4fc",
              fontSize: "0.95rem",
            }}
          >
            Auto Scheduling Utility
          </p>

          <h1
            style={{
              marginTop: "18px",
              marginBottom: "18px",
              fontSize: "4rem",
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            Book car services
            <br />
            faster and easier
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              fontSize: "1.15rem",
              lineHeight: 1.8,
              maxWidth: "640px",
            }}
          >
            ASU helps clients find service providers, send requests, receive
            offers, negotiate prices, and manage appointments in one simple
            platform.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              style={{
                padding: "14px 22px",
                borderRadius: "0",
                border: "1px solid white",
                background: "white",
                color: "black",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Start now
            </Link>

            <Link
              href="/register"
              style={{
                padding: "14px 22px",
                borderRadius: "0",
                border: "1px solid #3f3f46",
                background: "transparent",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Create account
            </Link>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoBlock}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "1.25rem",
                fontWeight: 800,
              }}
            >
              For clients
            </h3>
            <p
              style={{
                margin: 0,
                color: "#a1a1aa",
                lineHeight: 1.7,
              }}
            >
              Choose a company, describe the service you need, compare offers,
              and keep track of your appointments.
            </p>
          </div>

          <div className={styles.infoBlock}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "1.25rem",
                fontWeight: 800,
              }}
            >
              For providers
            </h3>
            <p
              style={{
                margin: 0,
                color: "#a1a1aa",
                lineHeight: 1.7,
              }}
            >
              Receive requests, accept or decline them, set prices, and manage
              your work through the calendar dashboard.
            </p>
          </div>

          <div className={styles.infoBlock}>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "1.25rem",
                fontWeight: 800,
              }}
            >
              Direct support
            </h3>
            <p
              style={{
                margin: 0,
                color: "#a1a1aa",
                lineHeight: 1.7,
              }}
            >
              Need help or want more information? Call us directly at
              <strong style={{ color: "white" }}> +31 616 245 145</strong>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}