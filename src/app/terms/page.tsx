import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* NAVBAR */}
      <header className="fixed top-6 left-0 right-0 w-full max-w-7xl mx-auto px-6 z-50">
        <div className="neo-card flex justify-between items-center px-6 py-4 border-white/5 bg-slate-900/80 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-dark.png" alt="Rhockstar Connect" width={180} height={40} className="group-hover:opacity-80 transition-opacity" />
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white font-medium py-2">Login</Link>
            <Link href="/register" className="neo-button-primary px-6 py-2 shadow-none hover:shadow-brand/20">Join Now</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-slate-400">Effective Date: 25th August 2026</p>
        </div>

        <div className="prose prose-invert prose-brand max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand prose-p:text-slate-300 prose-p:leading-relaxed">
          <p>
            Welcome to Rhockstar Connect, a digital platform operated by Rhockstar Nation that connects individuals for employment opportunities, professional networking, relationships, and social interactions.
          </p>
          <p>
            By creating an account, accessing, or using Rhockstar Connect, you agree to these Terms of Service. If you do not agree with these terms, you must not use our platform.
          </p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">1. About Rhockstar Connect</h2>
          <p>Rhockstar Connect provides a platform where users can:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
            <li>Create professional profiles</li>
            <li>Search and apply for job opportunities</li>
            <li>Connect with employers and professionals</li>
            <li>Communicate with other users</li>
            <li>Build social and personal connections</li>
            <li>Participate in dating and relationship-oriented interactions</li>
          </ul>
          <p>Rhockstar Connect is a connection platform. We do not guarantee employment, successful relationships, marriage, or any specific outcome from using the platform.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">2. Eligibility</h2>
          <p>To use Rhockstar Connect:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
            <li>You must be at least 18 years old.</li>
            <li>You must provide accurate information during registration.</li>
            <li>You must maintain the security of your account.</li>
            <li>You must not create an account using another person&apos;s identity.</li>
          </ul>
          <p>Users below 18 years old are strictly prohibited.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">3. User Account Responsibilities</h2>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
            <li>Keeping your login details secure.</li>
            <li>Maintaining accurate profile information.</li>
            <li>Updating your information when necessary.</li>
            <li>All activities performed through your account.</li>
          </ul>
          <p>You must immediately notify Rhockstar Connect if you suspect unauthorized access.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">4. Profile Information</h2>
          <p>Users may provide information including: Name, Profile picture, Biography, Skills and experience, Employment history, Education details, Interests, and Relationship preferences.</p>
          <p>You agree that your profile information must be truthful and must not mislead other users.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">5. Job Marketplace Rules</h2>
          <p>Employers and job seekers must:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
            <li>Provide accurate job descriptions.</li>
            <li>Avoid fraudulent job postings.</li>
            <li>Avoid requesting illegal payments from applicants.</li>
            <li>Treat applicants professionally.</li>
          </ul>
          <p>Rhockstar Connect does not guarantee that a job application will result in employment, employers are verified unless explicitly stated, or users will receive responses. Users should perform their own verification before accepting employment opportunities.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">6. Dating and Social Interaction Rules</h2>
          <p>Rhockstar Connect allows adults to connect socially and romantically. Users must:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
            <li>Respect other users.</li>
            <li>Communicate honestly.</li>
            <li>Obtain consent before sharing personal information.</li>
            <li>Avoid harassment or inappropriate behaviour.</li>
          </ul>
          <p>The following are prohibited: Sexual harassment, Threats, Blackmail, Scams, Fake identities, Impersonation, Sharing private images without consent, and Exploitation of other users.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">7. User Safety</h2>
          <p>Rhockstar Connect encourages users to: Verify people before meeting offline, Avoid sending money to strangers, Protect personal information, and Report suspicious accounts.</p>
          <p>Rhockstar Connect is not responsible for personal meetings, relationships, employment agreements, or interactions that happen outside the platform.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">8. Prohibited Activities</h2>
          <p>Users may not: Upload illegal content, Promote scams or fraudulent opportunities, Use the platform for criminal activities, Spam other users, Collect user information without permission, Attempt to hack, disrupt, or damage the platform, Create multiple fake accounts.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">9. Content Ownership</h2>
          <p>Users retain ownership of content they upload. By uploading content, you grant Rhockstar Connect permission to display and use that content only for operating and improving the platform. You confirm that you have the right to upload any content you submit.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">10. Privacy and Data Protection</h2>
          <p>Rhockstar Connect collects and processes user information to provide platform services. This may include information needed for: Account creation, Profile management, Communication, Job matching, Platform security, Service improvement. Users have rights regarding their personal information as described in our Privacy Policy.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">11. Account Suspension and Termination</h2>
          <p>Rhockstar Connect may suspend or remove accounts that: Violate these Terms, Endanger other users, Provide false information, Engage in fraudulent activities. Users may request account deletion according to our Privacy Policy.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">12. Payments and Premium Features</h2>
          <p>If Rhockstar Connect introduces paid features: Prices will be displayed before payment. Users agree to provide accurate payment information. Payments may be processed through third-party payment providers.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">13. Disclaimer</h2>
          <p>Rhockstar Connect provides a platform for connection. We do not guarantee: Employment opportunities, Successful relationships, User identity accuracy unless verified, Safety of interactions outside the platform. Users are responsible for their own decisions and interactions.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">14. Limitation of Liability</h2>
          <p>To the maximum extent allowed by law, Rhockstar Nation shall not be responsible for: Losses resulting from user interactions, Employment decisions, Relationship outcomes, Unauthorized user behaviour.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">15. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of Rhockstar Connect after updates means you accept the revised Terms.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">16. Governing Law</h2>
          <p>These Terms shall be governed by the laws applicable in Nigeria.</p>

          <h2 className="text-2xl mt-10 mb-4 border-b border-white/10 pb-2">17. Contact Information</h2>
          <p>For questions, complaints, or reports:</p>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5 mt-4">
            <p className="font-bold text-white m-0">Rhockstar Connect</p>
            <p className="m-0 text-sm">Operated by Rhockstar Nation</p>
            <p className="mt-2 text-brand">Email: rhockstarconnect@gmail.com</p>
          </div>
          
          <div className="mt-12 text-center text-sm text-slate-500 italic pb-12">
            By creating an account on Rhockstar Connect, you confirm that you have read, understood, and agreed to these Terms of Service.
          </div>
        </div>
      </main>
    </div>
  );
}
