"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  BriefcaseBusiness,
  Calendar,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Lock,
  Mail,
  User,
  Users,
} from "lucide-react";

import { registerUser } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

/* =========================================================
   REGISTER FORM
========================================================= */

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const [accountType, setAccountType] = useState<
    "standard" | "employer"
  >("standard");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================================
     INITIAL STATE
  ========================================================= */

  useEffect(() => {
    if (profile) {
      router.push("/feed");
      return;
    }

    const ref =
      searchParams.get("ref") ||
      searchParams.get("code") ||
      searchParams.get("referral");

    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams, profile, router]);

  /* =========================================================
     FORM COMPLETION
  ========================================================= */

  const allRequiredFieldsFilled =
    fullName.trim() !== "" &&
    username.trim() !== "" &&
    email.trim() !== "" &&
    dobMonth !== "" &&
    dobDay !== "" &&
    dobYear !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    termsAccepted;

  const canSubmit = allRequiredFieldsFilled && !loading;

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequiredFieldsFilled || loading) {
      return;
    }

    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!dobYear || !dobMonth || !dobDay) {
      setError("Please complete your date of birth");
      setLoading(false);
      return;
    }

    const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;

    /* AGE CHECK */

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference = today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setError(
        "You must be at least 18 years old to join Rhockstar Connect, as per our Terms of Service."
      );
      setLoading(false);
      return;
    }

    const { user, error } = await registerUser(
      email,
      password,
      fullName,
      username,
      referralCode,
      accountType
    );

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      router.push("/feed");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =====================================================
            LEFT — BRAND VISUAL
        ===================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.07] bg-[#0B1120] lg:block">
          <Image
            src="/images/landing_networking.jpg"
            alt="People connecting through Rhockstar"
            fill
            priority
            sizes="55vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#020617]/25" />

          <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/75 via-[#020617]/10 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-transparent to-[#020617]/30" />

          {/* BRAND LABEL */}

          <div className="absolute left-8 top-8 z-20 xl:left-10 xl:top-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#020617]/55 px-3 py-2 text-[9px] font-semibold text-white/70 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Rhockstar Connect
            </div>
          </div>

          {/* COMMUNITY CARD */}

          <div className="absolute right-8 top-[21%] z-20 w-[230px] rounded-[18px] border border-white/[0.12] bg-[#020617]/75 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl xl:right-10">
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
              Meet people who share your interests, ambitions and experiences.
            </p>
          </div>

          {/* OPPORTUNITY CARD */}

          <div className="absolute left-8 top-[42%] z-20 w-[245px] rounded-[18px] border border-white/[0.12] bg-[#020617]/75 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl xl:left-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08]">
                <BriefcaseBusiness className="h-4 w-4 text-white" />
              </div>

              <div>
                <p className="text-[10px] font-semibold text-white">
                  Opportunities
                </p>

                <p className="mt-0.5 text-[8px] text-white/35">
                  Jobs · Careers · Collaborations
                </p>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTENT */}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 xl:p-10 2xl:p-12">
            <div className="max-w-[620px]">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                Join the network
              </span>

              <h2 className="mt-4 max-w-[600px] text-[38px] font-semibold leading-[1.04] tracking-[-0.045em] text-white xl:text-[46px] 2xl:text-[50px]">
                Meet people.
                <br />
                Find what&apos;s{" "}
                <span className="text-white/55">next.</span>
              </h2>

              <p className="mt-4 max-w-[480px] text-[12px] leading-6 text-white/45 xl:text-[13px]">
                Build your profile, discover people, explore opportunities and
                become part of communities built around what matters to you.
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

        {/* =====================================================
            RIGHT — REGISTRATION
        ===================================================== */}

        <section className="relative z-20 flex min-h-screen flex-col bg-[#020617]">
          {/* NAV */}

          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6 lg:px-8 xl:px-10">
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

          {/* FORM */}

          <div className="flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 xl:px-10">
            <div className="w-full max-w-[520px]">
              {/* HEADING */}

              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 sm:text-[10px]">
                  Join Rhockstar
                </span>

                <h1 className="mt-3 text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[42px]">
                  Create your
                  <br />
                  <span className="text-white/55">account.</span>
                </h1>

                <p className="mt-4 max-w-[410px] text-[12px] leading-5 text-white/40 sm:text-[13px] sm:leading-6">
                  Build your profile and start discovering people, communities
                  and opportunities.
                </p>
              </div>

              {/* ACCOUNT TYPE */}

              <div className="mt-7 rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setAccountType("standard")}
                    aria-pressed={accountType === "standard"}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[11px] px-3 text-[11px] font-semibold transition-all sm:text-[12px] ${
                      accountType === "standard"
                        ? "bg-white text-[#020617] shadow-sm"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    Personal
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("employer")}
                    aria-pressed={accountType === "employer"}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[11px] px-3 text-[11px] font-semibold transition-all sm:text-[12px] ${
                      accountType === "employer"
                        ? "bg-white text-[#020617] shadow-sm"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    Employer
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-[14px] border border-red-400/15 bg-red-400/[0.07] px-4 py-3.5"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />

                  <p className="text-[11px] leading-5 text-red-200 sm:text-[12px]">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-6 space-y-5">
                {/* NAME + USERNAME */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="fullName"
                    label={
                      accountType === "employer"
                        ? "Company name"
                        : "Full name"
                    }
                    icon={<User className="h-4 w-4" />}
                  >
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder={
                        accountType === "employer"
                          ? "Company name"
                          : "Your full name"
                      }
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    id="username"
                    label="Username"
                    icon={<AtSign className="h-4 w-4" />}
                  >
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* EMAIL */}

                <Field
                  id="email"
                  label="Email address"
                  icon={<Mail className="h-4 w-4" />}
                >
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>

                {/* DATE OF BIRTH */}

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-white/30" />

                    <label className="text-[10px] font-semibold text-white/50">
                      Date of birth
                    </label>

                    <span className="ml-auto text-[9px] text-white/25">
                      You must be 18+
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      aria-label="Birth month"
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Month
                      </option>

                      {Array.from({ length: 12 }, (_, i) =>
                        String(i + 1).padStart(2, "0")
                      ).map((month) => (
                        <option key={month} value={month}>
                          {new Date(
                            2000,
                            parseInt(month) - 1
                          ).toLocaleString("default", {
                            month: "short",
                          })}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Birth day"
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Day
                      </option>

                      {Array.from({ length: 31 }, (_, i) =>
                        String(i + 1).padStart(2, "0")
                      ).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Birth year"
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Year
                      </option>

                      {Array.from({ length: 100 }, (_, i) =>
                        String(currentYear - 10 - i)
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PASSWORDS */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="password"
                    label="Password"
                    icon={<Lock className="h-4 w-4" />}
                  >
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={`${inputClass} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-0 top-0 flex h-[50px] w-11 items-center justify-center text-white/30 transition-colors hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </Field>

                  <Field
                    id="confirmPassword"
                    label="Confirm password"
                    icon={<Lock className="h-4 w-4" />}
                  >
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                      className={`${inputClass} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-0 top-0 flex h-[50px] w-11 items-center justify-center text-white/30 transition-colors hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </Field>
                </div>

                {/* REFERRAL CODE */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="referral"
                      className="flex items-center gap-2 text-[10px] font-semibold text-white/50"
                    >
                      <Gift className="h-3.5 w-3.5 text-white/35" />

                      Referral code

                      <span className="font-normal text-white/25">
                        Optional
                      </span>
                    </label>

                    {referralCode && (
                      <span className="text-[9px] font-semibold text-white/55">
                        Applied ✓
                      </span>
                    )}
                  </div>

                  <input
                    id="referral"
                    type="text"
                    placeholder="Enter referral username"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="h-[50px] w-full rounded-[13px] border border-white/[0.09] bg-white/[0.045] px-4 text-[12px] text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.14] focus:border-white/30 focus:bg-white/[0.065] focus:ring-2 focus:ring-white/[0.04]"
                  />
                </div>

                {/* TERMS */}

                <label className="group flex cursor-pointer items-start gap-3 pt-1">
                  <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) =>
                        setTermsAccepted(e.target.checked)
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

                  <span className="text-[10px] leading-5 text-white/35 transition-colors group-hover:text-white/50 sm:text-[11px]">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-white underline decoration-white/20 underline-offset-2 hover:opacity-70"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-white underline decoration-white/20 underline-offset-2 hover:opacity-70"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* SUBMIT */}

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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>

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
                    Complete all required fields and accept the terms to
                    continue.
                  </p>
                )}
              </form>

              {/* LOGIN */}

              <div className="mt-7 border-t border-white/[0.07] pt-6">
                <p className="text-center text-[11px] text-white/35 sm:text-[12px]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-white transition-opacity hover:opacity-65"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-semibold text-white/50"
      >
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-[25px] z-10 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  "h-[50px] w-full rounded-[13px] border border-white/[0.09] bg-white/[0.045] pl-11 pr-4 text-[12px] text-white outline-none transition-all placeholder:text-white/20 hover:border-white/[0.14] focus:border-white/30 focus:bg-white/[0.065] focus:ring-2 focus:ring-white/[0.04]";

const selectClass =
  "h-[50px] min-w-0 w-full cursor-pointer appearance-none rounded-[13px] border border-white/[0.09] bg-[#0B1120] px-2 text-center text-[11px] text-white outline-none transition-all hover:border-white/[0.14] focus:border-white/30 focus:ring-2 focus:ring-white/[0.04] sm:px-3 sm:text-[12px]";

/* =========================================================
   PAGE
========================================================= */

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-white" />

            <span className="text-[10px] font-medium text-white/30">
              Loading Rhockstar...
            </span>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}