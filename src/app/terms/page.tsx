import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Gavel,
  Heart,
  Mail,
  ShieldCheck,
} from "lucide-react";

const sections = [
  ["01", "About Rhockstar Connect", "about"],
  ["02", "Eligibility and Undertaking", "eligibility"],
  ["03", "User Account Responsibilities", "account"],
  ["04", "Profile Information", "profile"],
  ["05", "Job Marketplace Rules", "jobs"],
  ["06", "Dating and Social Interaction Rules", "dating"],
  ["07", "User Safety", "safety"],
  ["08", "Prohibited Activities", "prohibited"],
  ["09", "Content Ownership", "ownership"],
  ["10", "Privacy and Data Protection", "privacy"],
  ["11", "Account Suspension and Termination", "termination"],
  ["12", "Payments and Premium Features", "payments"],
  ["13", "Disclaimer", "disclaimer"],
  ["14", "Limitation of Liability", "liability"],
  ["15", "Changes to These Terms", "changes"],
  ["16", "Governing Law & Arbitration", "law"],
  ["17", "Contact Information", "contact"],
];

const SectionTitle = ({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) => (
  <div className="mb-5 flex items-start gap-4">
    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#020617] text-[10px] font-bold text-white">
      {number}
    </span>

    <h2 className="pt-0.5 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-[#020617] sm:text-[23px]">
      {children}
    </h2>
  </div>
);

export default function TermsPage() {
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
            <div className="max-w-[760px]">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06]">
                  <FileText className="h-3.5 w-3.5 text-white" />
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
                  Legal · Rhockstar Connect
                </span>
              </div>

              <h1 className="max-w-[700px] text-[42px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[56px] lg:text-[64px]">
                Terms of
                <br />
                <span className="text-white/55">Service.</span>
              </h1>

              <p className="mt-5 max-w-[570px] text-[14px] leading-6 text-white/55 sm:text-[15px] sm:leading-7">
                These Terms explain the rules, responsibilities and conditions
                that apply when using Rhockstar Connect.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.08] pt-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                    Document
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/70">
                    Terms of Service
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                    Sections
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/70">
                    17
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                    Platform
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/70">
                    Rhockstar Connect
                  </p>
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
            <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#020617]">
                <ShieldCheck className="h-[18px] w-[18px] text-white" />
              </div>

              <div className="max-w-[850px]">
                <p className="text-[15px] font-semibold text-[#020617]">
                  Welcome to Rhockstar Connect
                </p>

                <p className="mt-2 text-[13px] leading-6 text-[#4E596B]">
                  Rhockstar Connect is a digital platform operated to facilitate
                  connections among individuals for employment and career
                  opportunities, professional networking, personal relationships,
                  and social interaction.
                </p>

                <p className="mt-3 text-[13px] leading-6 text-[#4E596B]">
                  By creating an account, accessing, or using Rhockstar Connect,
                  you voluntarily agree to the following Terms of Service. If you
                  do not agree with these terms, you are advised to exit the use
                  of Rhockstar Connect.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DOCUMENT
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

            {/* TERMS */}

            <article className="min-w-0 overflow-hidden rounded-[22px] border border-[#020617]/[0.08] bg-[#EEF1F4] shadow-[0_12px_35px_rgba(2,6,23,0.06)] sm:rounded-[26px]">
              <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                {/* 01 */}

                <section id="about" className="scroll-mt-8">
                  <SectionTitle number="01">
                    About Rhockstar Connect
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect is a social platform where users can among
                    other related activities:
                  </p>

                  <TermsList
                    items={[
                      "Create professional profiles",
                      "Search and apply for job opportunities",
                      "Connect with employers and professionals",
                      "Communicate with other users",
                      "Build social and personal connections",
                      "Increase social media presence",
                      "Participate in dating and relationship-oriented interactions",
                    ]}
                  />
                </section>

                <Divider />

                {/* 02 */}

                <section id="eligibility" className="scroll-mt-8">
                  <SectionTitle number="02">
                    Eligibility and Undertaking
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    To use Rhockstar Connect:
                  </p>

                  <TermsList
                    items={[
                      "You undertake that you are above the legal age of 18 years old.",
                      "You undertake to provide accurate information/documents during registration.",
                      "You undertake to maintain the security of your account.",
                      "You undertake not to impersonate or create an account using another person’s identity.",
                      "You undertake not to open or operate more than one account.",
                      "You undertake not to use this platform for any illegal or fraudulent activities.",
                      "You undertake that Rhockstar Connect may leverage your personal data in its activities.",
                      "You undertake that Rhockstar Connect may release your data to relevant government or regulatory body as may be necessary or expedient under the law.",
                      "You undertake that Rhockstar Nation retains the right to accept or refuse you on this platform.",
                    ]}
                  />
                </section>

                <Divider />

                {/* 03 */}

                <section id="account" className="scroll-mt-8">
                  <SectionTitle number="03">
                    User Account Responsibilities
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    You are responsible for:
                  </p>

                  <TermsList
                    items={[
                      "Keeping your login details secure",
                      "Maintaining accurate profile information",
                      "Updating your information when necessary",
                      "All activities performed through your account",
                    ]}
                  />

                  <Notice>
                    Rhockstar Connect shall not be responsible for any
                    unauthorized access into your account.
                  </Notice>
                </section>

                <Divider />

                {/* 04 */}

                <section id="profile" className="scroll-mt-8">
                  <SectionTitle number="04">Profile Information</SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    At the point of registration or any such other times as
                    Rhockstar Connect may deem expedient, users shall be required
                    to provide necessary information including:
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      "Name",
                      "Profile picture",
                      "Biography",
                      "Skills & experience",
                      "Employment history",
                      "Education details",
                      "Interests",
                      "Relationship preferences",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[12px] border border-[#020617]/[0.07] bg-[#E2E7EC] px-3 py-3 text-[11px] font-medium text-[#465163]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    You undertake that all your profile information shall be
                    true, correct and accurate and shall not be misleading. You
                    shall be liable for any misrepresentations contained in or
                    implied in any information provided.
                  </p>
                </section>

                <Divider />

                {/* 05 */}

                <section id="jobs" className="scroll-mt-8">
                  <SectionTitle number="05">
                    Job Marketplace Rules
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Employers and job seekers on this platform must:
                  </p>

                  <TermsList
                    items={[
                      "Provide accurate job descriptions.",
                      "Provide truthful and accurate information in their profiles, applications, résumés, credentials, qualifications, employment history, posts and other materials submitted through the Platform.",
                      "Avoid fraudulent job postings.",
                      "Avoid any form of impersonation.",
                      "Avoid requesting illegal payments from applicants.",
                      "Treat applicants professionally.",
                      "Not use the Platform to send excessive, repetitive, misleading, or unsolicited communications to other users.",
                      "Protect personal and confidential information obtained through the Platform responsibly and only for legitimate purposes related to the relevant employment or recruitment activity.",
                      "Comply with all applicable employment and anti-discrimination laws.",
                    ]}
                  />

                  <div className="mt-6 rounded-[16px] border border-[#020617]/10 bg-[#DCE2E8] p-5">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-[#020617]" />

                      <p className="text-[12px] font-semibold text-[#020617]">
                        Rhockstar Connect does not guarantee that:
                      </p>
                    </div>

                    <TermsList
                      items={[
                        "A job application will result in employment.",
                        "Employers are verified unless explicitly stated.",
                        "Users will receive responses.",
                      ]}
                    />
                  </div>

                  <div className="mt-5 space-y-4 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    <p>
                      Users undertake to have performed their independent
                      verification before dealing with one another, accepting
                      employment opportunities, etc. Rhockstar Connect shall not
                      be liable for transactions or dealing between individuals
                      or entities on the platform.
                    </p>

                    <p>
                      Rhockstar Connect reserves the right, but does not assume
                      an obligation, to review, restrict, suspend, or remove job
                      postings, applications, accounts, messages, or other
                      content that it reasonably believes violates these Terms,
                      applicable law, or the safety and integrity of the
                      Platform.
                    </p>

                    <p>
                      Rhockstar Connect may also suspend or terminate access to
                      the Platform where a user engages in fraudulent,
                      deceptive, abusive, unlawful, or otherwise prohibited
                      employment-related conduct or for any reason whatsoever as
                      it deems fit.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 06 */}

                <section id="dating" className="scroll-mt-8">
                  <SectionTitle number="06">
                    Dating and Social Interaction Rules
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect allows adults to connect socially and
                    romantically. Users must:
                  </p>

                  <TermsList
                    items={[
                      "Respect other users",
                      "Communicate honestly",
                      "Obtain express consent before sharing any personal information",
                      "Avoid harassment or inappropriate behaviour",
                    ]}
                  />

                  <div className="mt-6 rounded-[16px] border border-[#020617]/10 bg-[#DCE2E8] p-5">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#020617]" />

                      <p className="text-[12px] font-semibold text-[#020617]">
                        The following are strictly prohibited:
                      </p>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {[
                        "Any harassment",
                        "Threats",
                        "Blackmail",
                        "Scams",
                        "Fake identities",
                        "Impersonation",
                        "Sharing private images without consent",
                        "Exploitation of other users",
                        "Any unlawful or illegal acts prohibited under law",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex gap-2 text-[12px] leading-5 text-[#465163]"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#020617]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <Divider />

                {/* 07 */}

                <section id="safety" className="scroll-mt-8">
                  <SectionTitle number="07">User Safety</SectionTitle>

                  <TermsList
                    items={[
                      "Verify people before meeting offline.",
                      "Avoid sending money to strangers.",
                      "Protect personal information.",
                      "Report suspicious accounts.",
                    ]}
                  />

                  <Notice>
                    Rhockstar Connect is not responsible for personal meetings,
                    relationships, or interactions that happen between
                    individuals or entities on this platform.
                  </Notice>
                </section>

                <Divider />

                {/* 08 */}

                <section id="prohibited" className="scroll-mt-8">
                  <SectionTitle number="08">
                    Prohibited Activities
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Users shall not:
                  </p>

                  <TermsList
                    items={[
                      "Upload illegal content.",
                      "Promote scams or fraudulent opportunities.",
                      "Use the platform for criminal activities.",
                      "Spam other users.",
                      "Collect user information without permission.",
                      "Attempt to hack, disrupt, or damage the platform.",
                      "Create multiple fake accounts.",
                      "Be involved in any fraudulent or illegal activities on the platform.",
                    ]}
                  />
                </section>

                <Divider />

                {/* 09 */}

                <section id="ownership" className="scroll-mt-8">
                  <SectionTitle number="09">Content Ownership</SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    You confirm that you have the right to upload any content you
                    submit. You shall retain ownership of content you upload.
                    However, by uploading content, you grant Rhockstar Connect
                    permission to display and use that content only for
                    operating and improving the platform.
                  </p>
                </section>

                <Divider />

                {/* 10 */}

                <section id="privacy" className="scroll-mt-8">
                  <SectionTitle number="10">
                    Privacy and Data Protection
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect collects and processes user information to
                    provide platform services. This may include information
                    needed for:
                  </p>

                  <TermsList
                    items={[
                      "Account creation",
                      "Profile management",
                      "Communication",
                      "Job matching",
                      "Platform security",
                      "Service improvement",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Users have rights regarding their personal information as
                    described in our Privacy Policy.
                  </p>
                </section>

                <Divider />

                {/* 11 */}

                <section id="termination" className="scroll-mt-8">
                  <SectionTitle number="11">
                    Account Suspension and Termination
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect may suspend or remove accounts that:
                  </p>

                  <TermsList
                    items={[
                      "Violate any of these Terms.",
                      "Endanger other users.",
                      "Provide false information.",
                      "Engage in fraudulent activities.",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect may suspend or remove accounts for any
                    reason whatsoever as it deems fit.
                  </p>

                  <p className="mt-3 text-[12px] leading-5 text-[#697586]">
                    Users may request account deletion according to our Privacy
                    Policy.
                  </p>
                </section>

                <Divider />

                {/* 12 */}

                <section id="payments" className="scroll-mt-8">
                  <SectionTitle number="12">
                    Payments and Premium Features
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Regarding any subscription model on Rhockstar Connect:
                  </p>

                  <TermsList
                    items={[
                      "Subscription costs will be displayed before payment.",
                      "Users agree to provide accurate payment information.",
                      "Payments may be processed through third-party payment providers.",
                    ]}
                  />

                  <div className="mt-5 border-l-2 border-[#020617] bg-[#DCE2E8] px-4 py-3.5">
                    <p className="text-[13px] font-medium leading-6 text-[#020617]">
                      Rhockstar Connect retains the right to provide only
                      exclusive subscription model services at any time.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 13 */}

                <section id="disclaimer" className="scroll-mt-8">
                  <SectionTitle number="13">Disclaimer</SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    Rhockstar Connect provides a platform for connection. We do
                    not guarantee:
                  </p>

                  <TermsList
                    items={[
                      "Employment opportunities.",
                      "Successful relationships.",
                      "User identity accuracy unless verified.",
                      "Safety of interactions outside the platform.",
                    ]}
                  />

                  <p className="mt-5 text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    No agency or any such similar relationship is created between
                    this platform and its users, and we shall not be liable or
                    responsible for any transactions or dealings between persons
                    or entities on this platform.
                  </p>

                  <Notice>
                    Users are responsible for their own decisions and
                    interactions.
                  </Notice>
                </section>

                <Divider />

                {/* 14 */}

                <section id="liability" className="scroll-mt-8">
                  <SectionTitle number="14">
                    Limitation of Liability
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    To the maximum extent allowed by law, Rhockstar Connect shall
                    not be responsible for:
                  </p>

                  <TermsList
                    items={[
                      "Losses resulting from user interactions",
                      "Employment decisions.",
                      "Relationship outcomes.",
                      "Unauthorized user behaviour.",
                    ]}
                  />
                </section>

                <Divider />

                {/* 15 */}

                <section id="changes" className="scroll-mt-8">
                  <SectionTitle number="15">
                    Changes to These Terms
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    We may, without any further notice to you, update or modify
                    these Terms from time to time. Continued use of Rhockstar
                    Connect after updates means you accept the revised Terms.
                  </p>
                </section>

                <Divider />

                {/* 16 */}

                <section id="law" className="scroll-mt-8">
                  <SectionTitle number="16">
                    Governing Law &amp; Arbitration
                  </SectionTitle>

                  <div className="rounded-[16px] border border-[#020617]/10 bg-[#DCE2E8] p-5 sm:p-6">
                    <Gavel className="mb-4 h-5 w-5 text-[#020617]" />

                    <p className="text-[13px] leading-6 text-[#465163] sm:text-[14px]">
                      These Terms shall be governed by the laws applicable in
                      Nigeria. Any dispute between parties shall be settled by
                      amicable resolution, failing which parties shall result to
                      arbitration consisting of a sole arbitrator to be
                      appointed by the Lagos Court of Arbitration and in
                      accordance with the extant Lagos Arbitration Law.
                    </p>
                  </div>
                </section>

                <Divider />

                {/* 17 */}

                <section id="contact" className="scroll-mt-8">
                  <SectionTitle number="17">
                    Contact Information
                  </SectionTitle>

                  <p className="text-[13px] leading-6 text-[#566070] sm:text-[14px]">
                    For questions, complaints, or reports:
                  </p>

                  <div className="mt-5 rounded-[18px] bg-[#020617] p-5 text-white sm:p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[16px] font-semibold">
                          Rhockstar Connect
                        </p>

                        <p className="mt-1 text-[11px] text-white/40">
                          Operated by Rhockstar
                        </p>

                        <a
                          href="mailto:rhockstarconnect@gmail.com"
                          className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-white transition-colors hover:text-white/70 sm:text-[13px]"
                        >
                          <Mail className="h-4 w-4" />
                          rhockstarconnect@gmail.com
                        </a>
                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[10px] text-white/45">
                        <Gavel className="h-3.5 w-3.5 text-white/70" />
                        Lagos Court of Arbitration Jurisdiction
                      </div>
                    </div>
                  </div>
                </section>

                {/* ACCEPTANCE */}

                <div className="mt-10 border-t border-[#020617]/[0.08] pt-8 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#020617]">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>

                  <p className="mx-auto mt-3 max-w-[620px] text-[11px] leading-5 text-[#697586] sm:text-[12px]">
                    By creating an account on Rhockstar Connect, you voluntarily
                    confirm that you have read, understood, and agreed to these
                    Terms of Service.
                  </p>
                </div>
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
                  aria-current="page"
                  className="text-[13px] font-medium text-white"
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

          {/* BOTTOM BAR */}

          <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-white/30 sm:text-[11px]">
              © 2026 Rhockstar Connect. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />

              <p className="text-[10px] text-white/30 sm:text-[11px]">
                Connect. Discover. Belong.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   REUSABLE TERMS COMPONENTS
========================================================= */

function Divider() {
  return <div className="my-8 h-px bg-[#020617]/[0.08] sm:my-10" />;
}

function TermsList({ items }: { items: string[] }) {
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

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-[#020617] bg-[#DCE2E8] px-4 py-3.5">
      <p className="text-[12px] leading-5 text-[#566070] sm:text-[13px]">
        {children}
      </p>
    </div>
  );
}