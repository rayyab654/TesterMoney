"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/niche-finder");
    } catch (err: any) {
      console.error(err);
      let msg = "Terjadi kesalahan saat login.";

      if (err.code === "auth/invalid-credential") {
        msg = "Email atau password salah.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf7ea] flex items-center justify-center px-4">
      <div className="max-w-md w-full border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
        {/* Header */}
        <header className="border-b-4 border-black bg-[#ffd84f] px-5 py-3">
          <p className="text-[11px] md:text-xs font-semibold uppercase">
            AI Short Generator — Login
          </p>
        </header>

        <section className="px-5 py-5 text-xs md:text-sm">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide mb-1">
              AI Short Generator
            </h1>
            <p className="text-[11px] md:text-xs">
              Masuk untuk mengakses semua fitur tools AI kamu.
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-bold">Email</label>
              <input
                required
                type="email"
                className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8]"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">Password</label>
              <input
                required
                type="password"
                className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-600 font-semibold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full border-2 border-black bg-[#ff4fa3] text-white font-bold uppercase text-[11px] px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
