import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-sm uppercase tracking-[0.4em] text-indigo-200">
          ASU PLATFORM
        </p>

        <h1 className="max-w-5xl text-6xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
          Auto Scheduling Utility
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-400">
          A modern platform where clients book appointments and auto services
          manage them easily.
        </p>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-white bg-white px-8 py-4 font-semibold !text-black transition hover:opacity-90"
          >
            <span className="!text-black">Login</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-white bg-transparent px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-black"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}