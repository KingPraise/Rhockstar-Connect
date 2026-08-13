import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Mail, ArrowLeft, Gavel, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* NAVBAR */}
      <header className="fixed top-6 left-0 right-0 w-full max-w-7xl mx-auto px-4 sm:px-6 z-50">
        <div className="neo-card flex justify-between items-center px-4 sm:px-6 py-3.5 border-white/5 bg-slate-900/80 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-dark.png" alt="Rhockstar Connect" width={160} height={36} className="group-hover:opacity-80 transition-opacity" />
          </Link>
          <div className="flex gap-3">
            <Link href="/" className="text-slate-300 hover:text-white text-sm font-medium py-2 flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link href="/register" className="neo-button-primary px-4 sm:px-6 py-2 text-xs sm:text-sm shadow-none hover:shadow-brand/20">Join Now</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-36 sm:pt-40 pb-20">
        {/* Page Header */}
        <div className="neo-card p-6 sm:p-10 mb-10 bg-slate-900/40 border-white/5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand to-brand-purple" />
          <div className="flex items-center gap-3 text-brand text-sm font-bold uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Please read these Terms carefully before using the Rhockstar Connect platform.
          </p>
        </div>

        {/* Content Container */}
        <div className="neo-card p-6 sm:p-10 bg-slate-900/40 border-white/5 backdrop-blur-md space-y-10 text-slate-300 text-sm sm:text-base leading-relaxed">
          
          <div className="bg-brand/10 border border-brand/20 rounded-2xl p-5 sm:p-6 text-slate-200">
            <p className="font-semibold text-white mb-2">Welcome to Rhockstar Connect</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Rhockstar Connect is a digital platform operated to facilitate connections among individuals for employment and career opportunities, professional networking, personal relationships, and social interaction.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mt-3">
              By creating an account, accessing, or using Rhockstar Connect, you voluntarily agree to the following Terms of Service. If you do not agree with these terms, you are advised to exit the use of Rhockstar Connect.
            </p>
          </div>

          {/* Section 1 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">1.</span> About Rhockstar Connect
            </h2>
            <p className="mb-3">Rhockstar Connect is a social platform where users can among other related activities:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
              <li>Create professional profiles</li>
              <li>Search and apply for job opportunities</li>
              <li>Connect with employers and professionals</li>
              <li>Communicate with other users</li>
              <li>Build social and personal connections</li>
              <li>Increase social media presence</li>
              <li>Participate in dating and relationship-oriented interactions</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">2.</span> Eligibility and Undertaking
            </h2>
            <p className="mb-3">To use Rhockstar Connect:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>You undertake that you are above the legal age of 18 years old.</li>
              <li>You undertake to provide accurate information/documents during registration.</li>
              <li>You undertake to maintain the security of your account.</li>
              <li>You undertake not to impersonate or create an account using another person&apos;s identity.</li>
              <li>You undertake not to open or operate more than one account.</li>
              <li>You undertake not to use this platform for any illegal or fraudulent activities.</li>
              <li>You undertake that Rhockstar Connect may leverage your personal data in its activities.</li>
              <li>You undertake that Rhockstar Connect may release your data to relevant government or regulatory body as may be necessary or expedient under the law.</li>
              <li>You undertake that Rhockstar Nation retains the right to accept or refuse you on this platform.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">3.</span> User Account Responsibilities
            </h2>
            <p className="mb-3">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Keeping your login details secure</li>
              <li>Maintaining accurate profile information</li>
              <li>Updating your information when necessary</li>
              <li>All activities performed through your account</li>
            </ul>
            <p className="text-slate-400 text-xs sm:text-sm italic bg-slate-800/50 p-3 rounded-xl border border-white/5">
              Rhockstar Connect shall not be responsible for any unauthorized access into your account.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">4.</span> Profile Information
            </h2>
            <p className="mb-3">
              At the point of registration or any such other times as Rhockstar Connect may deem expedient, users shall be required to provide necessary information including:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {['Name', 'Profile picture', 'Biography', 'Skills & experience', 'Employment history', 'Education details', 'Interests', 'Relationship preferences'].map((item) => (
                <div key={item} className="bg-slate-800/40 p-2.5 rounded-xl border border-white/5 text-xs text-center font-medium text-slate-300">
                  {item}
                </div>
              ))}
            </div>
            <p className="text-slate-300">
              You undertake that all your profile information shall be true, correct and accurate and shall not be misleading. You shall be liable for any misrepresentations contained in or implied in any information provided.
            </p>
          </section>

          {/* Section 5 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">5.</span> Job Marketplace Rules
            </h2>
            <p className="mb-3">Employers and job seekers on this platform must:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-6">
              <li>Provide accurate job descriptions.</li>
              <li>Provide truthful and accurate information in their profiles, applications, résumés, credentials, qualifications, employment history, posts and other materials submitted through the Platform.</li>
              <li>Avoid fraudulent job postings.</li>
              <li>Avoid any form of impersonation.</li>
              <li>Avoid requesting illegal payments from applicants.</li>
              <li>Treat applicants professionally.</li>
              <li>Not use the Platform to send excessive, repetitive, misleading, or unsolicited communications to other users.</li>
              <li>Protect personal and confidential information obtained through the Platform responsibly and only for legitimate purposes related to the relevant employment or recruitment activity.</li>
              <li>Comply with all applicable employment and anti-discrimination laws.</li>
            </ul>

            <div className="bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-3 mb-4">
              <p className="font-semibold text-white text-sm">Rhockstar Connect does not guarantee that:</p>
              <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm text-slate-400">
                <li>A job application will result in employment.</li>
                <li>Employers are verified unless explicitly stated.</li>
                <li>Users will receive responses.</li>
              </ul>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Users undertake to have performed their independent verification before dealing with one another, accepting employment opportunities, etc. Rhockstar Connect shall not be liable for transactions or dealing between individuals or entities on the platform.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Rhockstar Connect reserves the right, but does not assume an obligation, to review, restrict, suspend, or remove job postings, applications, accounts, messages, or other content that it reasonably believes violates these Terms, applicable law, or the safety and integrity of the Platform.
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              Rhockstar Connect may also suspend or terminate access to the Platform where a user engages in fraudulent, deceptive, abusive, unlawful, or otherwise prohibited employment-related conduct or for any reason whatsoever as it deems fit.
            </p>
          </section>

          {/* Section 6 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">6.</span> Dating and Social Interaction Rules
            </h2>
            <p className="mb-3">Rhockstar Connect allows adults to connect socially and romantically. Users must:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-6">
              <li>Respect other users</li>
              <li>Communicate honestly</li>
              <li>Obtain express consent before sharing any personal information</li>
              <li>Avoid harassment or inappropriate behaviour</li>
            </ul>

            <p className="font-semibold text-white text-sm mb-2">The following are strictly prohibited:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Any harassment', 'Threats', 'Blackmail', 'Scams', 'Fake identities', 'Impersonation', 'Sharing private images without consent', 'Exploitation of other users', 'Any unlawful or illegal acts prohibited under law'].map((item) => (
                <div key={item} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-2.5 rounded-xl text-xs font-medium">
                  • {item}
                </div>
              ))}
            </div>
          </section>

          {/* Section 7 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">7.</span> User Safety
            </h2>
            <p className="mb-3">Users undertake to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Verify people before meeting offline.</li>
              <li>Avoid sending money to strangers.</li>
              <li>Protect personal information.</li>
              <li>Report suspicious accounts.</li>
            </ul>
            <p className="text-slate-400 text-xs sm:text-sm italic bg-slate-800/50 p-4 rounded-xl border border-white/5">
              Rhockstar Connect is not responsible for personal meetings, relationships, or interactions that happen between individuals or entities on this platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">8.</span> Prohibited Activities
            </h2>
            <p className="mb-3">Users shall not:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
              <li>Upload illegal content.</li>
              <li>Promote scams or fraudulent opportunities.</li>
              <li>Use the platform for criminal activities.</li>
              <li>Spam other users.</li>
              <li>Collect user information without permission.</li>
              <li>Attempt to hack, disrupt, or damage the platform.</li>
              <li>Create multiple fake accounts.</li>
              <li>Be involved in any fraudulent or illegal activities on the platform.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">9.</span> Content Ownership
            </h2>
            <p>
              You confirm that you have the right to upload any content you submit. You shall retain ownership of content you upload. However, by uploading content, you grant Rhockstar Connect permission to display and use that content only for operating and improving the platform.
            </p>
          </section>

          {/* Section 10 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">10.</span> Privacy and Data Protection
            </h2>
            <p className="mb-3">
              Rhockstar Connect collects and processes user information to provide platform services. This may include information needed for:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Account creation</li>
              <li>Profile management</li>
              <li>Communication</li>
              <li>Job matching</li>
              <li>Platform security</li>
              <li>Service improvement</li>
            </ul>
            <p>Users have rights regarding their personal information as described in our Privacy Policy.</p>
          </section>

          {/* Section 11 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">11.</span> Account Suspension and Termination
            </h2>
            <p className="mb-3">Rhockstar Connect may suspend or remove accounts that:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Violate any of these Terms.</li>
              <li>Endanger other users.</li>
              <li>Provide false information.</li>
              <li>Engage in fraudulent activities.</li>
            </ul>
            <p className="mb-2">Rhockstar Connect may suspend or remove accounts for any reason whatsoever as it deems fit.</p>
            <p className="text-slate-400 text-xs sm:text-sm">Users may request account deletion according to our Privacy Policy.</p>
          </section>

          {/* Section 12 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">12.</span> Payments and Premium Features
            </h2>
            <p className="mb-3">Regarding any subscription model on Rhockstar Connect:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Subscription costs will be displayed before payment.</li>
              <li>Users agree to provide accurate payment information.</li>
              <li>Payments may be processed through third-party payment providers.</li>
            </ul>
            <p className="text-brand font-medium">
              Rhockstar Connect retains the right to provide only exclusive subscription model services at any time.
            </p>
          </section>

          {/* Section 13 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">13.</span> Disclaimer
            </h2>
            <p className="mb-3">Rhockstar Connect provides a platform for connection. We do not guarantee:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300 mb-4">
              <li>Employment opportunities.</li>
              <li>Successful relationships.</li>
              <li>User identity accuracy unless verified.</li>
              <li>Safety of interactions outside the platform.</li>
            </ul>
            <p className="mb-3">
              No agency or any such similar relationship is created between this platform and its users, and we shall not be liable or responsible for any transactions or dealings between persons or entities on this platform.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              Users are responsible for their own decisions and interactions.
            </p>
          </section>

          {/* Section 14 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">14.</span> Limitation of Liability
            </h2>
            <p className="mb-3">To the maximum extent allowed by law, Rhockstar Connect shall not be responsible for:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
              <li>Losses resulting from user interactions</li>
              <li>Employment decisions.</li>
              <li>Relationship outcomes.</li>
              <li>Unauthorized user behaviour.</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">15.</span> Changes to These Terms
            </h2>
            <p>
              We may, without any further notice to you, update or modify these Terms from time to time. Continued use of Rhockstar Connect after updates means you accept the revised Terms.
            </p>
          </section>

          {/* Section 16 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-brand">16.</span> Governing Law & Arbitration
            </h2>
            <p className="leading-relaxed">
              These Terms shall be governed by the laws applicable in Nigeria. Any dispute between parties shall be settled by amicable resolution, failing which parties shall result to arbitration consisting of a sole arbitrator to be appointed by the Lagos Court of Arbitration and in accordance with the extant Lagos Arbitration Law.
            </p>
          </section>

          {/* Section 17 */}
          <section className="border-t border-white/5 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-brand">17.</span> Contact Information
            </h2>
            <p className="mb-4">For questions, complaints, or reports:</p>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-white text-lg">Rhockstar Connect</p>
                <p className="text-xs text-slate-400">Operated by Rhockstar</p>
                <a href="mailto:rhockstarconnect@gmail.com" className="mt-2 text-brand font-medium flex items-center gap-2 hover:underline text-sm sm:text-base">
                  <Mail className="w-4 h-4" /> rhockstarconnect@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                <Gavel className="w-4 h-4 text-brand" /> Lagos Court of Arbitration Jurisdiction
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="pt-8 border-t border-white/10 text-center text-xs sm:text-sm text-slate-500 italic">
            By creating an account on Rhockstar Connect, you voluntarily confirm that you have read, understood, and agreed to these Terms of Service.
          </div>
        </div>
      </main>
    </div>
  );
}

