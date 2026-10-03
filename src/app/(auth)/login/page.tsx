"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  Users,
} from "lucide-react";

import { loginUser } from "@/lib/auth";
import ResetPasswordModal from "@/components/auth/ResetPasswordModal";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    if (profile) {
      router.push("/feed");
      return;
    }

    const savedEmail = localStorage.getItem(
      "rhockstar_remembered_email"
    );

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [profile, router]);

  /* =========================================================
     FORM COMPLETION
  ========================================================= */

  const allRequiredFieldsFilled =
    email.trim() !== "" && password.trim() !== "";

  const canSubmit = allRequiredFieldsFilled && !loading;

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequiredFieldsFilled || loading) {
      return;
    }

    setError("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem(
        "rhockstar_remembered_email",
        email
      );
    } else {
      localStorage.removeItem(
        "rhockstar_remembered_email"
      );
    }

    const { user, error } = await loginUser(
      email,
      password,
      rememberMe
    );

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      window.location.href = "/feed";
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        {/* =====================================================
            LEFT — LOGIN
        ===================================================== */}

        <section className="relative z-20 flex min-h-screen flex-col bg-[#020617]">
          {/* NAV */}

          <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-4 sm:px-6 lg:px-8 xl:px-10">
            <Link
              href="/"
              aria-label="Back to Rhockstar homepage"
              className="inline-flex items-center"
            >
              <Image
                src="/logo-light.png"
                alt="Rhockstar Connect"
                width={150}
                height={36}
                priority
                className="h-auto w-[105px] object-contain sm:w-[115px]"
              />
            </Link>

            <Link
              href="/"
              className="group inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 text-[11px] font-semibold text-white/55 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden min-[390px]:inline">
                Back home
              </span>
            </Link>
          </header>

          {/* FORM AREA */}

          <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8 xl:px-10">
            <div className="w-full max-w-[430px]">
              {/* HEADING */}

              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 sm:text-[10px]">
                  Welcome back
                </span>

                <h1 className="mt-3 text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[42px]">
                  Continue where
                  <br />
                  <span className="text-white/55">
                    you left off.
                  </span>
                </h1>

                <p className="mt-4 max-w-[370px] text-[12px] leading-5 text-white/40 sm:text-[13px] sm:leading-6">
                  Sign in to reconnect with your people,
                  conversations and opportunities.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="mt-7 flex items-start gap-3 rounded-[14px] border border-red-400/15 bg-red-400/[0.07] px-4 py-3.5"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />

                  <p className="text-[11px] leading-5 text-red-200 sm:text-[12px]">
                    {error}
                  </p>
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-semibold text-white/50"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      className="h-[52px] w-full rounded-[13px] border border-white/[0.09] bg-white/[0.045] pl-11 pr-4 text-[13px] text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.14] focus:border-white/30 focus:bg-white/[0.065] focus:ring-2 focus:ring-white/[0.04]"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[10px] font-semibold text-white/50"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setResetModalOpen(true)
                      }
                      className="text-[10px] font-semibold text-white/40 transition-colors hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      className="h-[52px] w-full rounded-[13px] border border-white/[0.09] bg-white/[0.045] pl-11 pr-12 text-[13px] text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.14] focus:border-white/30 focus:bg-white/[0.065] focus:ring-2 focus:ring-white/[0.04]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/30 transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}

                <div className="flex items-center justify-between pt-1">
                  <label className="group flex cursor-pointer items-center gap-2.5">
                    <span className="relative flex h-[18px] w-[18px] items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(
                            e.target.checked
                          )
                        }
                        className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border border-white/[0.15] bg-white/[0.05] transition-all checked:border-white checked:bg-white"
                      />

                      <svg
                        viewBox="0 0 14 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="pointer-events-none absolute h-2.5 w-2.5 text-[#020617] opacity-0 peer-checked:opacity-100"
                      >
                        <path
                          d="M1 5L4.5 8.5L13 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <span className="text-[11px] font-medium text-white/40 transition-colors group-hover:text-white/65 sm:text-[12px]">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                  className={`group flex h-[52px] w-full items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold transition-all duration-200 ${
                    canSubmit
                      ? "cursor-pointer bg-white text-[#020617] hover:bg-[#E8EBF0]"
                      : "cursor-not-allowed border border-white/[0.06] bg-white/[0.07] text-white/25"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Access account</span>

                      <ArrowRight
                        className={`h-4 w-4 transition-transform ${
                          canSubmit
                            ? "group-hover:translate-x-1"
                            : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {/* COMPLETION HINT */}

                {!allRequiredFieldsFilled && (
                  <p className="text-center text-[9px] leading-4 text-white/25">
                    Enter your email and password to
                    continue.
                  </p>
                )}
              </form>

              {/* CREATE ACCOUNT */}

              <div className="mt-7 border-t border-white/[0.07] pt-6">
                <p className="text-center text-[11px] text-white/35 sm:text-[12px]">
                  New to Rhockstar?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-white transition-opacity hover:opacity-65"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* TERMS */}

              <p className="mx-auto mt-5 max-w-[350px] text-center text-[9px] leading-4 text-white/20 sm:text-[10px]">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-white/35 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-white/35 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — BRAND / DISCOVERY
        ===================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#0B1120] lg:block">
          {/* IMAGE */}

          <Image
            src="/images/landing_networking.jpg"
            alt="People connecting through Rhockstar"
            fill
            priority
            sizes="55vw"
            className="object-cover"
          />

          {/* OVERLAYS */}

          <div className="absolute inset-0 bg-[#020617]/30" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-[#020617]/15 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-transparent to-[#020617]/25" />

          {/* TOP LABEL */}

          <div className="absolute right-8 top-8 z-20 xl:right-10 xl:top-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#020617]/55 px-3 py-2 text-[9px] font-semibold text-white/70 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />

              Rhockstar Connect
            </div>
          </div>

          {/* FLOATING CONNECTION CARD */}

          <div className="absolute left-8 top-[22%] z-20 w-[230px] rounded-[18px] border border-white/[0.12] bg-[#020617]/75 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl xl:left-10">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08]">
                <Users className="h-4 w-4 text-white" />
              </div>

              <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/30">
                Community
              </span>
            </div>

            <p className="mt-5 text-[12px] font-semibold text-white">
              Find your people
            </p>

            <p className="mt-1.5 text-[9px] leading-4 text-white/40">
              Connect with people who share your
              interests, goals and experiences.
            </p>
          </div>

          {/* BOTTOM COPY */}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 xl:p-10 2xl:p-12">
            <div className="max-w-[620px]">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                Welcome back
              </span>

              <h2 className="mt-4 max-w-[600px] text-[38px] font-semibold leading-[1.04] tracking-[-0.045em] text-white xl:text-[46px] 2xl:text-[50px]">
                Your next connection
                <br />
                could change{" "}
                <span className="text-white/55">
                  everything.
                </span>
              </h2>

              <p className="mt-4 max-w-[480px] text-[12px] leading-6 text-white/45 xl:text-[13px]">
                Reconnect with your network, continue
                your conversations and discover
                what&apos;s waiting for you.
              </p>

              <div className="mt-7 flex items-center gap-5 border-t border-white/[0.1] pt-5">
                <div>
                  <p className="text-[15px] font-semibold text-white">
                    10K+
                  </p>

                  <p className="mt-0.5 text-[8px] text-white/35">
                    Members
                  </p>
                </div>

                <div className="h-7 w-px bg-white/[0.1]" />

                <div>
                  <p className="text-[15px] font-semibold text-white">
                    25K+
                  </p>

                  <p className="mt-0.5 text-[8px] text-white/35">
                    Connections
                  </p>
                </div>

                <div className="h-7 w-px bg-white/[0.1]" />

                <div>
                  <p className="text-[15px] font-semibold text-white">
                    500+
                  </p>

                  <p className="mt-0.5 text-[8px] text-white/35">
                    Opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          RESET PASSWORD MODAL
      ===================================================== */}

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />
    </main>
  );
}