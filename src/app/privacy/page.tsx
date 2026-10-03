import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  FileText,
  Globe2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

const sections = [
  ["01", "Information We Collect", "information"],
  ["02", "How We Use Your Information", "use"],
  ["03", "Public Profile Information", "public-profile"],
  ["04", "Posts, Photos, Videos & Content", "content"],
  ["05", "Messages and Communications", "messages"],
  ["06", "Job and Professional Information", "jobs"],
  ["07", "Cookies and Similar Technologies", "cookies"],
  ["08", "How We Share Information", "sharing"],
  ["09", "Data Security", "security"],
  ["10", "Data Retention", "retention"],
  ["11", "Your Privacy Choices and Rights", "rights"],
  ["12", "Account Deletion", "deletion"],
  ["13", "Children's Privacy", "children"],
  ["14", "Third-Party Services and Links", "third-party"],
  ["15", "International Data Transfers", "transfers"],
  ["16", "Data Protection and Nigerian Law", "nigeria"],
  ["17", "Changes to this Privacy Policy", "changes"],
  ["18", "Contact Us", "contact"],
  ["19", "Acceptance", "acceptance"],
];

function SectionTitle({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#020617] text-[10px] font-bold text-white">
        {number}
      </span>

      <h2 className="pt-0.5 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-[#020617] sm:text-[23px]">
        {children}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="my-8 h-px bg-[#020617]/[0.08] sm:my-10" />;
}

function PrivacyList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-[#020617]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Subheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-7 text-[15px] font-semibold tracking-[-0.015em] text-[#020617] sm:text-[16px]">
      {children}
    </h3>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-[#020617] bg-[#E9EDF2] px-4 py-3.5">
      <p className="text-[12px] leading-5 text-[#596273] sm:text-[13px]">
        {children}
      </p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#DCE1E8] text-[#020617] selection:bg-[#020617] selection:text-white">
      {/* =====================================================
          BACK TO HOMEPAGE
      ===================================================== */}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 xl:px-10">
          <Link
            href="/"
            aria-label="Back to homepage"
            className="pointer-events-auto group inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-[#020617]/80 px-4 text-[11px] font-semibold text-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all hover:border-white/[0.18] hover:bg-[#020617] hover:text-white sm:h-11 sm:px-5 sm:text-[12px]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to homepage
          </Link>
        </div>
      </div>

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#020617] text-white">
          <div className="pointer-events-none absolute -left-40 top-10 h-[380px] w-[380px] rounded-full bg-white/[0.025] blur-[130px]" />
          <div className="pointer-events-none absolute -right-40 bottom-[-120px] h-[430px] w-[430px] rounded-full bg-white/[0.03] blur-[140px]" />

          <div className="relative mx-auto max-w-[1280px] px-4 pb-14 pt-[104px] sm:px-6 sm:pb-16 sm:pt-[116px] lg:px-8 lg:pb-20 lg:pt-[124px] xl:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <div className="max-w-[760px]">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06]">
                    <Lock className="h-3.5 w-3.5 text-white" />
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
                    Privacy · Data · Security
                  </span>
                </div>

                <h1 className="max-w-[700px] text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[56px] lg:text-[64px]">
                  Your data.
                  <br />
                  <span className="text-white/55">Your privacy.</span>
                </h1>

                <p className="mt-5 max-w-[600px] text-[14px] leading-6 text-white/55 sm:text-[15px] sm:leading-7">
                  This Privacy Policy explains how Rhockstar Connect collects,
                  uses, stores, protects, controls, processes and shares
                  information when you use the platform.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/[0.08] pt-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                      Document
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-white/70">
                      Privacy Policy
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                      Last updated
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-white/70">
                      September 5, 2026
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                      Sections
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-white/70">
                      19
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden justify-end lg:flex">
                <div className="w-full max-w-[280px] rounded-[24px] border border-white/[0.09] bg-white/[0.045] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#020617]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <p className="mt-7 text-[13px] font-semibold">
                    Privacy matters.
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-white/40">
                    Understand what information is collected, why it is used,
                    and the choices available to you.
                  </p>

                  <div className="mt-6 space-y-2">
                    {["Information", "Security", "Your rights"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between border-t border-white/[0.07] pt-2 text-[9px] text-white/35"
                      >
                        <span>{item}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRODUCTION
        ===================================================== */}

        <section className="border-b border-[#020617]/[0.07] bg-[#C9D0DA]">
          <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
            <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020617]">
                <ShieldCheck className="h-[18px] w-[18px] text-white" />
              </div>

              <div className="max-w-[880px] space-y-3">
                <p className="text-[15px] font-semibold text-[#020617]">
                  Privacy at Rhockstar Connect
                </p>

                <p className="text-[13px] leading-6 text-[#4E596B]">
                  Welcome to Rhockstar Connect. Your privacy is very important
                  to us. This Privacy Policy explains how Rhockstar Connect
                  (&quot;Rhockstar Connect&quot;, &quot;Platform&quot;,
                  &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                  collects, uses, stores, protects, controls, processes and
                  shares information when you use our website, platform,
                  applications, features, and services.
                </p>

                <p className="text-[13px] leading-6 text-[#4E596B]">
                  By creating an account or using Rhockstar Connect, you
                  acknowledge that you have read, understood and agree to be
                  bound by the terms contained in this Privacy Policy.
                </p>

                <p className="text-[13px] leading-6 text-[#4E596B]">
                  We encourage you to review the Privacy Policy whenever you
                  interact with us to stay informed about our information
                  practices and the ways you can help protect your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRIVACY DOCUMENT
        ===================================================== */}

        <section className="bg-[#DCE1E8]">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-16 xl:grid-cols-[260px_minmax(0,1fr)] xl:px-10">
            {/* TABLE OF CONTENTS */}

            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <div className="mb-5 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-[#020617]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#667085]">
                    On this page
                  </p>
                </div>

                <nav className="max-h-[calc(100vh-64px)] overflow-y-auto border-l border-[#020617]/10 pr-3">
                  {sections.map(([number, label, id]) => (
                    <Link
                      key={id}
                      href={`#${id}`}
                      className="group flex gap-2.5 border-l-2 border-transparent py-2.5 pl-4 text-[11px] leading-4 text-[#667085] transition-colors hover:border-[#020617] hover:text-[#020617]"
                    >
                      <span className="text-[#87909E]">{number}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* CONTENT */}

            <article className="min-w-0 overflow-hidden rounded-[22px] border border-[#020617]/[0.08] bg-[#EEF1F4] shadow-[0_12px_35px_rgba(2,6,23,0.06)] sm:rounded-[26px]">
              <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                {/* 01 */}

                <section id="information" className="scroll-mt-8">
                  <SectionTitle number="01">
                    Information We Collect
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We may collect information that you provide directly to us,
                    generated through your use of the platform, and certain
                    information collected automatically as representatively
                    (not exhaustively) set out below.
                  </p>

                  <Subheading>A. Information You Provide</Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    When you create an account, we may collect certain
                    information including:
                  </p>

                  <PrivacyList
                    items={[
                      "Full name",
                      "Username",
                      "Email address",
                      "Phone number",
                      "Password or authentication information",
                      "Profile picture",
                      "Date of birth or age",
                      "Gender, where provided",
                      "Location or general area",
                      "Educational information",
                      "Employment and professional information",
                      "Skills and interests",
                      'Biography or "About Me" information',
                      "Social media or website links",
                      "Resume, certificates, portfolio, or other professional information",
                      "National identification",
                    ]}
                  />

                  <Subheading>
                    B. Information Generated Through Your Use of the Platform
                  </Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    When you use the Platform, certain information may be
                    generated, such as:
                  </p>

                  <PrivacyList
                    items={[
                      "Information contained in posts, comments, polls, photos, videos, and other contents you upload",
                      "Information you provide when applying for or posting jobs",
                      "Messages and other communications sent through the platform",
                      "Information provided when contacting our support team",
                      "Any other information that may be reasonably inferred from any information you shared on the Platform",
                    ]}
                  />

                  <Notice>
                    You are advised not to share or post sensitive personal
                    information publicly on the Platform unless you are
                    comfortable making such information available to other
                    users. Rhockstar shall not be liable for any such
                    information publicly shared.
                  </Notice>

                  <Subheading>
                    C. Information Collected Automatically
                  </Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    When you use Rhockstar Connect, we may automatically collect
                    information such as:
                  </p>

                  <PrivacyList
                    items={[
                      "IP address",
                      "Browser type and version",
                      "Device type",
                      "Operating system",
                      "Pages or features visited",
                      "Date and time of activity",
                      "Login and session information",
                      "General location information",
                      "Interaction with posts, profiles, jobs, messages, and other features",
                      "Device identifiers and similar technical information",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We use this information to operate, secure, maintain, and
                    improve the platform.
                  </p>
                </section>

                <Divider />

                {/* 02 */}

                <section id="use" className="scroll-mt-8">
                  <SectionTitle number="02">
                    How We Use Your Information
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We may use your information to:
                  </p>

                  <PrivacyList
                    items={[
                      "Create and manage your account",
                      "Provide and personalize Rhockstar Connect services",
                      "Display your profile to other users according to your privacy settings",
                      "Allow users to connect and communicate with one another",
                      "Enable posting, commenting, reactions, polls, photos, and videos",
                      "Facilitate job postings and job applications",
                      "Send notifications and important account messages",
                      "Respond to customer support requests",
                      "Improve the functionality, security, and performance of the platform",
                      "Detect and prevent fraud, abuse, spam, and unauthorized activity",
                      "Enforce our Terms of Service and other policies",
                      "Analyze usage trends and platform performance",
                      "Develop new features and services",
                      "Comply with applicable laws and legal obligations",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We will not use your personal information for purposes that
                    are materially different from those described in this
                    Privacy Policy without providing appropriate notice where
                    required or as may be required under any applicable law or
                    regulation.
                  </p>
                </section>

                <Divider />

                {/* 03 */}

                <section id="public-profile" className="scroll-mt-8">
                  <SectionTitle number="03">
                    Public Profile Information
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect is a social and professional networking
                    platform. Some information you add to your profile may be
                    visible to other users. Depending on your account and
                    privacy settings, this may include:
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      "Name",
                      "Profile photo",
                      "Username",
                      "Biography",
                      "Professional information",
                      "Education",
                      "Skills",
                      "Work experience",
                      "Interests",
                      "Posts and other content",
                      "Connection, follower, or engagement information",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[12px] border border-[#020617]/[0.07] bg-[#E2E7EC] px-3 py-3 text-[11px] font-medium leading-4 text-[#465163]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>

                <Divider />

                {/* 04 */}

                <section id="content" className="scroll-mt-8">
                  <SectionTitle number="04">
                    Posts, Photos, Videos, Comments and Other Content
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      When you upload or publish content on Rhockstar Connect,
                      that content may be accessible to other users. You are
                      responsible for the information and content you choose to
                      publish.
                    </p>

                    <p>
                      Do not upload personal information belonging to another
                      person without appropriate permission.
                    </p>

                    <p>
                      We may process and store your content for optimal use and
                      improvement of the Platform.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 05 */}

                <section id="messages" className="scroll-mt-8">
                  <SectionTitle number="05">
                    Messages and Communications
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect may provide private messaging and
                    communication features.
                  </p>

                  <p className="mt-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Messages are intended to facilitate communication between
                    users. We may however process messaging-related information
                    to:
                  </p>

                  <PrivacyList
                    items={[
                      "Deliver messages",
                      "Maintain the functionality of the messaging system",
                      "Prevent spam, abuse, fraud, and other harmful activity",
                      "Investigate violations of our policies",
                      "Maintain platform security",
                      "Comply with legal obligations",
                    ]}
                  />

                  <div className="mt-6 flex items-start gap-3 rounded-[16px] border border-[#020617]/10 bg-[#DCE2E8] p-4 sm:p-5">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#020617]" />

                    <p className="text-[12px] font-medium leading-5 text-[#465163] sm:text-[13px]">
                      We do not sell the contents of your private messages to
                      advertisers.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 06 */}

                <section id="jobs" className="scroll-mt-8">
                  <SectionTitle number="06">
                    Job and Professional Information
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      If you use our jobs or professional networking features,
                      information such as your professional profile, resume,
                      skills, employment history, applications, or job postings
                      may be shared with relevant users.
                    </p>

                    <p>
                      You are responsible for ensuring that information
                      submitted in job applications is accurate and that you
                      have the right to share such information. You shall be
                      personally liable for any wrong information submitted.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 07 */}

                <section id="cookies" className="scroll-mt-8">
                  <SectionTitle number="07">
                    Cookies and Similar Technologies
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect may use cookies, local storage, session
                    technologies, and similar technologies to, among others:
                  </p>

                  <PrivacyList
                    items={[
                      "Keep you signed in",
                      "Remember preferences",
                      "Maintain security",
                      "Understand how users interact with the platform",
                      "Improve performance",
                      "Provide relevant functionality",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    You may be able to control cookies through your browser or
                    device settings. Disabling certain technologies may affect
                    some of the functionality of the platform.
                  </p>
                </section>

                <Divider />

                {/* 08 */}

                <section id="sharing" className="scroll-mt-8">
                  <SectionTitle number="08">
                    How We Share Information
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We do not sell your personal information as a standalone
                    product. We may however share information in the following
                    circumstances:
                  </p>

                  <Subheading>Service Providers</Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We may share information with trusted third-party service
                    providers that help us operate Rhockstar Connect, such as
                    hosting, database, analytics, authentication, security,
                    communication, payment, and technical service providers.
                    These providers may only process information as necessary to
                    provide their services to us, subject to applicable
                    contractual or legal obligations. The Service Providers
                    shall be personally responsible for any wrong use of
                    information.
                  </p>

                  <Subheading>Publicly available information</Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Information that you intentionally make public or share
                    through social, professional, messaging, job, or other
                    platform features may be visible to other users.
                  </p>

                  <Subheading>Legal Requirements</Subheading>

                  <p className="mt-2 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We may disclose information when we reasonably believe
                    disclosure is necessary to:
                  </p>

                  <PrivacyList
                    items={[
                      "Comply with applicable law",
                      "Respond to valid legal processes",
                      "Protect the rights, property, or safety of Rhockstar Connect, our users, or others",
                      "Investigate fraud, abuse, security incidents, or violations of our policies",
                      "Enhance business transfers",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Please note that if Rhockstar Connect is involved in a
                    merger, acquisition, restructuring, financing, sale of
                    assets, or similar transaction, personal information may be
                    transferred as part of that transaction, subject to
                    applicable law.
                  </p>
                </section>

                <Divider />

                {/* 09 */}

                <section id="security" className="scroll-mt-8">
                  <SectionTitle number="09">Data Security</SectionTitle>

                  <div className="rounded-[18px] bg-[#020617] p-5 text-white sm:p-6">
                    <ShieldCheck className="h-5 w-5 text-white" />

                    <p className="mt-4 text-[13px] leading-6 text-white/60 sm:text-[14px]">
                      We take reasonable technical and organizational measures
                      designed to protect your personal information against
                      unauthorized access, loss, misuse, alteration, or
                      disclosure. However, we do not guarantee 100% security of
                      the Platform or database. You are responsible for keeping
                      your password and account credentials confidential and
                      should promptly notify us if you believe your account has
                      been compromised.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 10 */}

                <section id="retention" className="scroll-mt-8">
                  <SectionTitle number="10">Data Retention</SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We retain personal information as reasonably necessary to:
                  </p>

                  <PrivacyList
                    items={[
                      "Provide our services",
                      "Maintain your account",
                      "Fulfill the purposes described in this Privacy Policy",
                      "Comply with legal and regulatory obligations",
                      "Resolve disputes",
                      "Enforce our agreements",
                      "Prevent fraud and abuse",
                      "Maintain security and legitimate business records",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    When information is no longer required, we may delete,
                    anonymize, or securely dispose of it, subject to applicable
                    legal requirements.
                  </p>
                </section>

                <Divider />

                {/* 11 */}

                <section id="rights" className="scroll-mt-8">
                  <SectionTitle number="11">
                    Your Privacy Choices and Rights
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Depending on applicable law, you may have rights regarding
                    your personal information, including the right to:
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      "Access your personal information stored on the Platform",
                      "Correct inaccurate information",
                      "Update your account information",
                      "Request deletion of your information",
                      "Request restriction of certain processing",
                      "Object to processing certain information of you",
                      "Withdraw consent where processing is based on consent",
                      "Manage certain communication preferences",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex gap-3 rounded-[13px] border border-[#020617]/[0.07] bg-[#E2E7EC] p-3.5"
                      >
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#020617]" />

                        <p className="text-[11px] leading-5 text-[#465163]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-[12px] leading-5 text-[#697586]">
                    All requests shall be subject to legal limitations under
                    applicable law.
                  </p>
                </section>

                <Divider />

                {/* 12 */}

                <section id="deletion" className="scroll-mt-8">
                  <SectionTitle number="12">Account Deletion</SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      You may request deletion of your Rhockstar Connect
                      account.
                    </p>

                    <p>
                      When an account deletion request is processed, we shall
                      delete personal information associated with the account,
                      save for any information we may retain pursuant to any
                      applicable law.
                    </p>

                    <p>
                      Please note that some content may remain visible to other
                      users where it has been shared, reposted, or incorporated
                      into other platform features, subject to our applicable
                      policies and technical limitations.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 13 */}

                <section id="children" className="scroll-mt-8">
                  <SectionTitle number="13">
                    Children&apos;s Privacy
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      Rhockstar Connect is not intended for individuals who are
                      below the minimum age required to legally use the service
                      in their jurisdiction.
                    </p>

                    <p>
                      We do not knowingly collect personal information from
                      children in violation of applicable law. We shall not be
                      liable for any collection or processing of any personal of
                      any minor which we had collected or processed due to
                      misrepresentation from the minor or any other person.
                    </p>

                    <p>
                      If you believe that a child has provided personal
                      information to us without appropriate authorization,
                      please contact us so we may take appropriate action.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 14 */}

                <section id="third-party" className="scroll-mt-8">
                  <SectionTitle number="14">
                    Third-Party Services and Links
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      Rhockstar Connect may contain links to third-party
                      websites, applications, services, or platforms.
                    </p>

                    <p>
                      We are not responsible for the privacy practices, security,
                      content, or policies of third parties.
                    </p>

                    <p>
                      You are under obligation to review the privacy policy of
                      any third-party service providers before providing them
                      with personal information.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 15 */}

                <section id="transfers" className="scroll-mt-8">
                  <SectionTitle number="15">
                    International Data Transfers
                  </SectionTitle>

                  <div className="flex gap-4 rounded-[16px] border border-[#020617]/10 bg-[#DCE2E8] p-5">
                    <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-[#020617]" />

                    <p className="text-[13px] leading-6 text-[#465163] sm:text-[14px]">
                      Depending on where our service providers and technical
                      infrastructure are located, your information may be
                      processed or stored in countries other than the country in
                      which you live.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 16 */}

                <section id="nigeria" className="scroll-mt-8">
                  <SectionTitle number="16">
                    Data Protection and Nigerian Law
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      Rhockstar Connect is intended to operate in compliance
                      with applicable Nigerian data protection and privacy laws.
                    </p>

                    <p>
                      Where applicable, we will comply with the Nigeria Data
                      Protection Act 2023 (NDPA) and regulations, guidance, and
                      requirements issued by the relevant Nigerian data
                      protection authorities.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 17 */}

                <section id="changes" className="scroll-mt-8">
                  <SectionTitle number="17">
                    Changes to This Privacy Policy
                  </SectionTitle>

                  <div className="space-y-3 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      We may, unilaterally, update this Privacy Policy from time
                      to time to reflect changes to our services, technology,
                      legal requirements, or privacy practices.
                    </p>

                    <p>
                      When we make material changes, we may provide notice
                      through the platform, by email, or through another
                      appropriate method.
                    </p>

                    <p>
                      The &quot;Last Updated&quot; date at the top of this
                      Privacy Policy indicates the date when this Privacy Policy
                      was most recently revised and shall be applicable from the
                      date of such update.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 18 */}

                <section id="contact" className="scroll-mt-8">
                  <SectionTitle number="18">Contact Us</SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    If you have questions, concerns, complaints, or requests
                    regarding this Privacy Policy or your personal information,
                    please contact us:
                  </p>

                  <div className="mt-5 overflow-hidden rounded-[18px] bg-[#020617] p-5 text-white sm:p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07]">
                          <Mail className="h-4 w-4 text-white" />
                        </div>

                        <p className="mt-5 text-[16px] font-semibold">
                          Rhockstar Connect
                        </p>

                        <div className="mt-3 space-y-1.5">
                          <a
                            href="https://www.rhockstarconnect.com"
                            className="block text-[11px] text-white/45 transition-colors hover:text-white"
                          >
                            www.rhockstarconnect.com
                          </a>

                          <a
                            href="mailto:rhockstarconnect@gmail.com"
                            className="block text-[12px] font-medium text-white transition-colors hover:text-white/70"
                          >
                            rhockstarconnect@gmail.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-white/35">
                        <Database className="h-3.5 w-3.5 text-white/70" />
                        Privacy &amp; data requests
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[12px] leading-5 text-[#697586]">
                    We will make reasonable efforts to respond to privacy
                    requests as swift as practicably possible on our end.
                  </p>
                </section>

                <Divider />

                {/* 19 */}

                <section id="acceptance" className="scroll-mt-8">
                  <SectionTitle number="19">Acceptance</SectionTitle>

                  <div className="rounded-[18px] border border-[#020617]/10 bg-[#DCE2E8] p-5 sm:p-6">
                    <ShieldCheck className="h-5 w-5 text-[#020617]" />

                    <p className="mt-4 text-[13px] leading-6 text-[#465163] sm:text-[14px]">
                      By creating an account or using Rhockstar Connect, you
                      acknowledge that you have read, understood and agreed to
                      be bound by this Privacy Policy.
                    </p>

                    <p className="mt-3 text-[13px] font-medium leading-6 text-[#020617] sm:text-[14px]">
                      If you do not agree with this Privacy Policy, please do not
                      use Rhockstar Connect.
                    </p>
                  </div>
                </section>
              </div>
            </article>
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
                href="/register"
                className="group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-[#020617] transition-colors hover:bg-[#DCE1E8]"
              >
                Join Rhockstar
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
                  href="/#home"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="/#explore"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Explore
                </Link>

                <Link
                  href="/#features"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Features
                </Link>

                <Link
                  href="/#about"
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

                <Link
                  href="/terms"
                  className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  Terms
                </Link>

                <Link
                  href="/privacy"
                  aria-current="page"
                  className="text-[13px] font-medium text-white"
                >
                  Privacy
                </Link>
              </nav>
            </div>
          </div>

          <div className="h-px w-full bg-white/[0.08]" />

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