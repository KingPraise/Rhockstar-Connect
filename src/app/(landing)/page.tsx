"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Heart,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useInView } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

/* =========================================================
   DATA
========================================================= */

const mainFeatures = [
  {
    number: "01",
    eyebrow: "Social",
    title: "Meet people",
    description:
      "Discover new people, make friends, reconnect with old classmates, and expand your network beyond the people you already know.",
    image: "/images/landing_networking.jpg",
  },
  {
    number: "02",
    eyebrow: "Dating",
    title: "Find meaningful connections",
    description:
      "Meet people who share your interests and discover genuine connections — whether you're looking for friendship, dating, or something serious.",
    image: "/images/landing_profile.jpg",
  },
];

const smallFeatures = [
  {
    eyebrow: "Communities",
    title: "Find your people",
    description:
      "Join communities around schools, careers, industries, hobbies and the things you care about.",
    image: "/images/landing_messaging.jpg",
  },
  {
    eyebrow: "Conversations",
    title: "Chat & connect",
    description:
      "Start conversations, share ideas and stay connected with the people you meet.",
    image: "/images/landing_feed.jpg",
  },
  {
    eyebrow: "Profile",
    title: "Show people who you are",
    description:
      "Build a profile around your skills, interests, experience and personality.",
    image: "/images/landing_profile.jpg",
  },
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Explore", href: "#explore" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

const stats = [
  {
    value: 10,
    suffix: "K+",
    label: "Active members",
  },
  {
    value: 25,
    suffix: "K+",
    label: "Matches & connections",
  },
  {
    value: 500,
    suffix: "+",
    label: "Jobs & opportunities",
  },
  {
    value: 100,
    suffix: "+",
    label: "Public communities",
  },
];

/* =========================================================
   ANIMATED STAT
========================================================= */

function AnimatedStat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.4,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1600;
    const startTime = performance.now();

    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="flex min-h-[130px] flex-col justify-center px-5 py-7 sm:min-h-[150px] sm:px-8 lg:px-10"
    >
      <p className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-white sm:text-[38px]">
        {count}
        {suffix}
      </p>

      <p className="mt-3 text-[11px] font-medium text-white/40 sm:text-[12px]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const { profile } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.style.scrollPaddingTop = "80px";
    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.documentElement.style.scrollPaddingTop = "";
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#E8EBF0] text-[#020617] selection:bg-[#020617] selection:text-white">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-[100] border-b transition-all duration-300 ${
          menuOpen
            ? "border-white/[0.08] bg-[#020617]"
            : "border-white/[0.08] bg-[#020617]/95 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:h-[68px] sm:px-6 lg:h-[72px] lg:px-8 xl:px-10">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center"
          >
            <Image
              src="/logo-light.png"
              alt="Rhockstar Connect"
              width={150}
              height={36}
              priority
              className="h-auto w-[98px] object-contain sm:w-[108px] lg:w-[116px]"
            />
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-7 md:flex lg:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] font-medium text-white/55 transition-colors hover:text-white lg:text-[13px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-2 md:flex">
            {!profile && (
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center px-3 text-[12px] font-semibold text-white/65 transition-colors hover:text-white lg:text-[13px]"
              >
                Log in
              </Link>
            )}

            <Link
              href={profile ? "/feed" : "/register"}
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/[0.18] bg-white px-4 text-[12px] font-semibold text-[#020617] transition-all duration-200 hover:bg-[#E8EBF0] lg:h-11 lg:px-5 lg:text-[13px]"
            >
              {profile ? "Open Rhockstar" : "Join Rhockstar"}

              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white md:hidden"
          >
            {menuOpen ? (
              <X className="h-[19px] w-[19px]" />
            ) : (
              <Menu className="h-[19px] w-[19px]" />
            )}
          </button>
        </div>

        {/* MOBILE NAV */}

        <div
          id="mobile-menu"
          className={`overflow-hidden bg-[#020617] transition-[max-height,opacity] duration-300 ease-out md:hidden ${
            menuOpen
              ? "max-h-[calc(100dvh-64px)] border-t border-white/[0.08] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="flex min-h-[calc(100dvh-64px)] flex-col overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 sm:min-h-[calc(100dvh-68px)] sm:px-6">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
              Menu
            </p>

            <nav className="border-t border-white/[0.08]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="group flex min-h-[60px] items-center justify-between border-b border-white/[0.08]"
                >
                  <span className="text-[17px] font-semibold tracking-[-0.025em] text-white">
                    {link.label}
                  </span>

                  <ArrowRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="mb-5 rounded-[18px] border border-white/[0.09] bg-white/[0.05] p-4">
                <p className="text-[12px] font-semibold text-white">
                  Your people. Your opportunities.
                </p>

                <p className="mt-1.5 max-w-[300px] text-[11px] leading-5 text-white/45">
                  Meet people, find opportunities and discover communities built
                  around what matters to you.
                </p>
              </div>

              <Link
                href={profile ? "/feed" : "/register"}
                onClick={closeMenu}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#020617] active:scale-[0.99]"
              >
                {profile ? "Open Rhockstar" : "Join Rhockstar"}
                <ArrowRight className="h-4 w-4" />
              </Link>

              {!profile && (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mt-2 flex h-[50px] w-full items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] text-[13px] font-semibold text-white"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          id="home"
          className="relative overflow-hidden bg-[#020617] text-white"
        >
          <div className="pointer-events-none absolute -left-52 top-[15%] h-[430px] w-[430px] rounded-full bg-white/[0.025] blur-[140px]" />

          <div className="pointer-events-none absolute -right-48 bottom-[-100px] h-[500px] w-[500px] rounded-full bg-white/[0.03] blur-[150px]" />

          <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />

          <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-[104px] sm:px-6 sm:pb-20 sm:pt-[120px] lg:px-8 lg:pb-24 lg:pt-[132px] xl:px-10">
            <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 xl:gap-16">
              {/* HERO COPY */}

              <div className="mx-auto max-w-[590px] text-center lg:mx-0 lg:text-left">
                <div className="mb-5 flex items-center justify-center gap-2 lg:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
                    Social · Relationships · Opportunities
                  </span>
                </div>

                <h1 className="text-[40px] font-semibold leading-[0.99] tracking-[-0.055em] min-[380px]:text-[45px] sm:text-[56px] md:text-[62px] lg:text-[58px] xl:text-[66px]">
                  Your people.
                  <br />
                  Your opportunities.
                  <br />
                  <span className="text-white/55">Your connections.</span>
                </h1>

                <p className="mx-auto mt-5 max-w-[525px] text-[14px] leading-6 text-white/55 sm:mt-6 sm:text-[16px] sm:leading-7 lg:mx-0">
                  Meet new people, find love, discover opportunities, reconnect
                  with old friends and find communities that feel like yours.
                </p>

                <div className="mt-7 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-center lg:justify-start">
                  <Link
                    href={profile ? "/feed" : "/register"}
                    className="group inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-[#020617] transition-all hover:bg-[#E8EBF0] sm:px-7 sm:text-[14px]"
                  >
                    {profile ? "Go to your feed" : "Join Rhockstar"}

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {!profile && (
                    <Link
                      href="/login"
                      className="inline-flex h-[50px] items-center justify-center px-5 text-[13px] font-semibold text-white/60 transition-colors hover:text-white"
                    >
                      Already a member?
                    </Link>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-white/40 sm:text-[11px] lg:justify-start">
                  <span>
                    <strong className="font-semibold text-white">10K+</strong>{" "}
                    members
                  </span>

                  <span className="h-1 w-1 rounded-full bg-white/25" />

                  <span>
                    <strong className="font-semibold text-white">25K+</strong>{" "}
                    connections
                  </span>

                  <span className="h-1 w-1 rounded-full bg-white/25" />

                  <span>
                    <strong className="font-semibold text-white">500+</strong>{" "}
                    opportunities
                  </span>
                </div>
              </div>

              {/* =================================================
                  HERO IMAGE
              ================================================= */}

              <div className="mx-auto w-full max-w-[690px] lg:mx-0 lg:max-w-none">
                <div className="relative pb-6 sm:pb-8">
                  <div className="relative aspect-[1.03/1] overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#020617] shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:aspect-[1.2/1] sm:rounded-[28px] lg:aspect-[1.13/1]">
                    <Image
                      src="/images/landing_networking.jpg"
                      alt="People connecting on Rhockstar Connect"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/95 via-[#020617]/10 to-transparent" />

                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020617]/35 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-white/[0.12] bg-[#020617]/70 px-3 py-1.5 text-[8px] font-semibold text-white backdrop-blur-xl sm:left-5 sm:top-5 sm:text-[9px]">
                      Discover people around you
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[320px]">
                      <div className="flex items-center gap-3 rounded-[14px] border border-white/[0.11] bg-[#020617]/88 p-3 text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:rounded-[16px] sm:p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] text-white">
                          <Heart className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold sm:text-[11px]">
                            New connection found
                          </p>

                          <p className="mt-0.5 truncate text-[8px] text-white/45 sm:text-[9px]">
                            You both share an interest in Tech &amp; Music
                          </p>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-3 rounded-[14px] border border-white/[0.1] bg-[#020617]/92 p-3 text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:ml-7 sm:rounded-[16px] sm:p-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] text-white">
                          <BriefcaseBusiness className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold sm:text-[11px]">
                            New opportunity
                          </p>

                          <p className="mt-0.5 truncate text-[8px] text-white/45 sm:text-[9px]">
                            Matches your profile and interests
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating community card */}

                  <div className="absolute -bottom-1 right-3 z-20 hidden w-[160px] rounded-[17px] border border-white/[0.1] bg-[#020617]/95 p-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:block lg:-right-5">
                    <div className="flex items-center justify-between">
                      <Users className="h-4 w-4 text-white" />

                      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Community
                      </span>
                    </div>

                    <p className="mt-4 text-[11px] font-bold">
                      Creatives in Nigeria
                    </p>

                    <p className="mt-1 text-[8px] text-white/40">
                      8.2K members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ANIMATED STATS
        ===================================================== */}

        <section className="border-b border-white/[0.06] bg-[#0B1120] text-white">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={[
                  "border-white/[0.07]",
                  index === 0 ? "" : "border-l",
                  index === 2 ? "border-l-0 lg:border-l" : "",
                  index >= 2 ? "border-t lg:border-t-0" : "",
                ].join(" ")}
              >
                <AnimatedStat
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            INSIDE RHockstar
        ===================================================== */}

        <section id="explore" className="bg-[#DCE1E8]">
          <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28 xl:px-10">
            <div className="grid gap-7 md:grid-cols-[0.4fr_1fr] md:gap-12 lg:gap-20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#020617]">
                  Inside Rhockstar
                </span>

                <p className="mt-4 max-w-[260px] text-[12px] leading-5 text-[#4E596B] sm:text-[13px] sm:leading-6">
                  Explore the different sides of Rhockstar and how they bring
                  people, conversations and opportunities together.
                </p>
              </div>

              <div>
                <h2 className="max-w-[760px] text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#020617] sm:text-[42px] md:text-[48px] lg:text-[52px]">
                  Different reasons to connect.
                  <span className="text-[#667085]">
                    {" "}
                    One place to do it.
                  </span>
                </h2>

                <p className="mt-5 max-w-[590px] text-[14px] leading-6 text-[#4E596B] sm:text-[15px] sm:leading-7">
                  From meeting someone new to finding your next opportunity,
                  Rhockstar brings the different sides of connection into one
                  experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section id="features" className="bg-[#C9D0DA]">
          <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10">
            {/* MAIN FEATURE CARDS */}

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              {mainFeatures.map((feature) => (
                <article
                  key={feature.number}
                  className="group overflow-hidden rounded-[22px] border border-[#020617]/10 bg-[#E4E8EE] shadow-[0_12px_35px_rgba(2,6,23,0.08)] sm:rounded-[26px]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#B8C0CC] sm:aspect-[16/11]">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/45 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-white/[0.12] bg-[#020617]/85 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:left-5 sm:top-5 sm:text-[9px]">
                      {feature.eyebrow}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="flex items-start gap-4">
                      <span className="pt-1 text-[9px] font-bold tracking-[0.12em] text-[#020617]/45">
                        {feature.number}
                      </span>

                      <div>
                        <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-[#020617] sm:text-[23px]">
                          {feature.title}
                        </h3>

                        <p className="mt-2 max-w-[490px] text-[12px] leading-5 text-[#4E596B] sm:text-[13px] sm:leading-6">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* JOBS / OPPORTUNITIES */}

            <article className="mt-4 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#020617] text-white shadow-[0_18px_50px_rgba(2,6,23,0.18)] sm:mt-5 sm:rounded-[26px] lg:grid lg:grid-cols-[0.82fr_1.18fr]">
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/50">
                    Careers &amp; opportunities
                  </span>

                  <h3 className="mt-5 max-w-[450px] text-[29px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[36px] lg:text-[40px]">
                    Find what could move you forward.
                  </h3>

                  <p className="mt-4 max-w-[440px] text-[13px] leading-6 text-white/55 sm:text-[14px]">
                    Discover jobs, internships, collaborations, business
                    opportunities and other possibilities shared across the
                    Rhockstar network.
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-white/80">
                  <BriefcaseBusiness className="h-4 w-4 text-white" />

                  <span>Jobs · Internships · Collaborations</span>
                </div>
              </div>

              <div className="relative min-h-[270px] overflow-hidden sm:min-h-[360px] lg:min-h-[430px]">
                <Image
                  src="/images/landing_job_board.jpg"
                  alt="Jobs and opportunities on Rhockstar Connect"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#020617]/60 lg:via-transparent lg:to-transparent" />
              </div>
            </article>

            {/* SMALL FEATURE CARDS */}

            <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {smallFeatures.map((feature, index) => (
                <article
                  key={`${feature.title}-${index}`}
                  className={`group overflow-hidden rounded-[21px] border border-[#020617]/10 bg-[#E4E8EE] shadow-[0_12px_35px_rgba(2,6,23,0.07)] ${
                    index === 2 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#B8C0CC]">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/40 via-transparent to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full border border-white/[0.12] bg-[#020617]/85 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                      {feature.eyebrow}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-[18px] font-semibold tracking-[-0.025em] text-[#020617]">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-[12px] leading-5 text-[#4E596B]">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* SHARE & DISCOVER */}

            <article className="mt-4 grid overflow-hidden rounded-[22px] border border-[#020617]/10 bg-[#B8C2CF] sm:mt-5 sm:rounded-[26px] md:grid-cols-[1fr_0.92fr] md:items-center">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020617] text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>

                <span className="mt-7 block text-[9px] font-bold uppercase tracking-[0.17em] text-[#020617]/65">
                  Share &amp; discover
                </span>

                <h3 className="mt-3 max-w-[450px] text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#020617] sm:text-[34px]">
                  There&apos;s always something happening.
                </h3>

                <p className="mt-4 max-w-[470px] text-[13px] leading-6 text-[#394457]">
                  Share your thoughts, experiences and updates while discovering
                  what people across your network are talking about.
                </p>
              </div>

              <div className="relative min-h-[260px] sm:min-h-[330px] md:h-full md:min-h-[390px]">
                <Image
                  src="/images/landing_security.jpg"
                  alt="Share and discover on Rhockstar Connect"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/25 via-transparent to-transparent" />
              </div>
            </article>
          </div>
        </section>

        {/* =====================================================
            ABOUT
        ===================================================== */}

        <section
          id="about"
          className="relative overflow-hidden bg-[#020617] text-white"
        >
          <div className="pointer-events-none absolute -right-40 top-0 h-[400px] w-[400px] rounded-full bg-white/[0.025] blur-[150px]" />

          <div className="relative mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28 xl:px-10">
            <div className="grid gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  About Rhockstar
                </span>

                <h2 className="mt-5 max-w-[470px] text-[34px] font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-[44px] lg:text-[48px]">
                  Built around people, not just profiles.
                </h2>
              </div>

              <div className="lg:pt-8">
                <p className="max-w-[600px] text-[14px] leading-7 text-white/55 sm:text-[16px]">
                  Rhockstar Connect is a social platform built around people,
                  connections and opportunities.
                </p>

                <p className="mt-5 max-w-[600px] text-[14px] leading-7 text-white/55 sm:text-[16px]">
                  Whether you&apos;re looking to meet someone, find love, make
                  new friends, reconnect with an old classmate, find a job,
                  discover an opportunity, join a community or simply share
                  what&apos;s happening in your world, Rhockstar gives you one
                  place to do more.
                </p>

                <p className="mt-7 text-[16px] font-semibold tracking-[-0.02em] text-white sm:text-[18px]">
                  One platform. More people. More possibilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="bg-[#111827] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 xl:px-10">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#020617] px-5 py-12 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:rounded-[30px] sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <div className="pointer-events-none absolute -right-24 -top-32 h-[330px] w-[330px] rounded-full bg-white/[0.035] blur-[110px]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/45">
                  Start connecting
                </span>

                <h2 className="mt-4 max-w-[760px] text-[33px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[44px] lg:text-[52px]">
                  More people. More opportunities.{" "}
                  <span className="text-white/55">More possibilities.</span>
                </h2>

                <p className="mt-5 max-w-[540px] text-[13px] leading-6 text-white/45 sm:text-[14px]">
                  Build your profile, discover people and find the connections
                  that could take you somewhere new.
                </p>
              </div>

              <Link
                href={profile ? "/feed" : "/register"}
                className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-[#020617] transition-all hover:-translate-y-0.5 hover:bg-[#E8EBF0] sm:w-fit"
              >
                {profile ? "Go to your dashboard" : "Join Rhockstar"}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/[0.06] bg-[#020617] text-white">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-10 py-14 sm:py-16 md:grid-cols-[1.2fr_0.8fr] md:gap-12 lg:grid-cols-[1.4fr_0.6fr_0.6fr] lg:gap-16 lg:py-20">
            {/* BRAND */}

            <div className="max-w-[500px]">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/logo-light.png"
                  alt="Rhockstar Connect"
                  width={160}
                  height={40}
                  className="h-auto w-[112px] object-contain sm:w-[124px]"
                />
              </Link>

              <h2 className="mt-7 max-w-[450px] text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[33px] lg:text-[37px]">
                Your next connection could change{" "}
                <span className="text-white/55">everything.</span>
              </h2>

              <p className="mt-4 max-w-[410px] text-[12px] leading-6 text-white/45 sm:text-[13px]">
                Meet people, build meaningful connections, discover
                opportunities and find communities built around what matters to
                you.
              </p>

              <Link
                href={profile ? "/feed" : "/register"}
                className="group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-[#020617] transition-colors hover:bg-[#E8EBF0]"
              >
                {profile ? "Open Rhockstar" : "Join Rhockstar"}

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* PLATFORM */}

            <div>
              <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                Platform
              </p>

              <nav className="flex flex-col items-start gap-4">
                <Link
                  href="#home"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="#explore"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Explore
                </Link>

                <Link
                  href="#features"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Features
                </Link>

                <Link
                  href="#about"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  About
                </Link>
              </nav>
            </div>

            {/* ACCOUNT */}

            <div className="md:col-start-2 lg:col-start-auto">
              <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                Account
              </p>

              <nav className="flex flex-col items-start gap-4">
                {profile ? (
                  <Link
                    href="/feed"
                    className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                    >
                      Log in
                    </Link>

                    <Link
                      href="/register"
                      className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                    >
                      Create account
                    </Link>
                  </>
                )}

                <Link
                  href="/terms"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Terms
                </Link>

                <Link
                  href="/privacy"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Privacy
                </Link>
              </nav>
            </div>
          </div>

          <div className="h-px w-full bg-white/[0.08]" />

          {/* BOTTOM */}

          <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-white/30 sm:text-[11px]">
              © 2026 Rhockstar Connect. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />

              <span className="text-[10px] text-white/30 sm:text-[11px]">
                Connect. Discover. Belong.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

