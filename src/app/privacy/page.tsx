import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
            <Lock className="w-4 h-4" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Last updated: September 5, 2026
          </p>
        </div>

        {/* Content Container */}
        <div className="neo-card p-6 sm:p-10 bg-slate-900/40 border-white/5 backdrop-blur-md space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to Rhockstar Connect. Your privacy is very important to us. This Privacy Policy explains how Rhockstar Connect ("Rhockstar Connect", "Platform", "we", "us", or "our") collects, uses, stores, protects, controls, processes and shares information when you use our website, platform, applications, features, and services.
          </p>
          <p>
            By creating an account or using Rhockstar Connect, you acknowledge that you have read, understood and agree to be bound by the terms contained in this Privacy Policy.
          </p>
          <p>
            We encourage you to review the Privacy Policy whenever you interact with us to stay informed about our information practices and the ways you can help protect your privacy.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. INFORMATION WE COLLECT</h2>
          <p>We may collect information that you provide directly to us, generated through your use of the platform, and certain information collected automatically as representatively (not exhaustively) set out below.</p>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">A. Information You Provide</h3>
          <p>When you create an account, we may collect certain information including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Full name</li>
            <li>Username</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Password or authentication information</li>
            <li>Profile picture</li>
            <li>Date of birth or age</li>
            <li>Gender, where provided</li>
            <li>Location or general area</li>
            <li>Educational information</li>
            <li>Employment and professional information</li>
            <li>Skills and interests</li>
            <li>Biography or "About Me" information</li>
            <li>Social media or website links</li>
            <li>Resume, certificates, portfolio, or other professional information</li>
            <li>National identification</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">B. Information Generated Through Your Use of the Platform</h3>
          <p>When you use the Platform, certain information may be generated, such as:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Information contained in posts, comments, polls, photos, videos, and other contents you upload</li>
            <li>Information you provide when applying for or posting jobs</li>
            <li>Messages and other communications sent through the platform</li>
            <li>Information provided when contacting our support team</li>
            <li>Any other information that may be reasonably inferred from any information you shared on the Platform</li>
          </ul>
          <p>You are advised not to share or post sensitive personal information publicly on the Platform unless you are comfortable making such information available to other users. Rhockstar shall not be liable for any such information publicly shared.</p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">C. Information Collected Automatically</h3>
          <p>When you use Rhockstar Connect, we may automatically collect information such as:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Pages or features visited</li>
            <li>Date and time of activity</li>
            <li>Login and session information</li>
            <li>General location information</li>
            <li>Interaction with posts, profiles, jobs, messages, and other features</li>
            <li>Device identifiers and similar technical information</li>
          </ul>
          <p>We use this information to operate, secure, maintain, and improve the platform.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. HOW WE USE YOUR INFORMATION</h2>
          <p>We may use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Create and manage your account</li>
            <li>Provide and personalize Rhockstar Connect services</li>
            <li>Display your profile to other users according to your privacy settings</li>
            <li>Allow users to connect and communicate with one another</li>
            <li>Enable posting, commenting, reactions, polls, photos, and videos</li>
            <li>Facilitate job postings and job applications</li>
            <li>Send notifications and important account messages</li>
            <li>Respond to customer support requests</li>
            <li>Improve the functionality, security, and performance of the platform</li>
            <li>Detect and prevent fraud, abuse, spam, and unauthorized activity</li>
            <li>Enforce our Terms of Service and other policies</li>
            <li>Analyze usage trends and platform performance</li>
            <li>Develop new features and services</li>
            <li>Comply with applicable laws and legal obligations</li>
          </ul>
          <p>We will not use your personal information for purposes that are materially different from those described in this Privacy Policy without providing appropriate notice where required or as may be required under any applicable law or regulation.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. PUBLIC PROFILE INFORMATION</h2>
          <p>Rhockstar Connect is a social and professional networking platform. Some information you add to your profile may be visible to other users. Depending on your account and privacy settings, this may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Name</li>
            <li>Profile photo</li>
            <li>Username</li>
            <li>Biography</li>
            <li>Professional information</li>
            <li>Education</li>
            <li>Skills</li>
            <li>Work experience</li>
            <li>Interests</li>
            <li>Posts and other content</li>
            <li>Connection, follower, or engagement information</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. POSTS, PHOTOS, VIDEOS, COMMENTS AND OTHER CONTENT</h2>
          <p>When you upload or publish content on Rhockstar Connect, that content may be accessible to other users. You are responsible for the information and content you choose to publish.</p>
          <p>Do not upload personal information belonging to another person without appropriate permission.</p>
          <p>We may process and store your content for optimal use and improvement of the Platform.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. MESSAGES AND COMMUNICATIONS</h2>
          <p>Rhockstar Connect may provide private messaging and communication features.</p>
          <p>Messages are intended to facilitate communication between users. We may however process messaging-related information to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Deliver messages</li>
            <li>Maintain the functionality of the messaging system</li>
            <li>Prevent spam, abuse, fraud, and other harmful activity</li>
            <li>Investigate violations of our policies</li>
            <li>Maintain platform security</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not sell the contents of your private messages to advertisers.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">6. JOB AND PROFESSIONAL INFORMATION</h2>
          <p>If you use our jobs or professional networking features, information such as your professional profile, resume, skills, employment history, applications, or job postings may be shared with relevant users.</p>
          <p>You are responsible for ensuring that information submitted in job applications is accurate and that you have the right to share such information. You shall be personally liable for any wrong information submitted.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">7. COOKIES AND SIMILAR TECHNOLOGIES</h2>
          <p>Rhockstar Connect may use cookies, local storage, session technologies, and similar technologies to, among others:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Keep you signed in</li>
            <li>Remember preferences</li>
            <li>Maintain security</li>
            <li>Understand how users interact with the platform</li>
            <li>Improve performance</li>
            <li>Provide relevant functionality</li>
          </ul>
          <p>You may be able to control cookies through your browser or device settings. Disabling certain technologies may affect some of the functionality of the platform.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">8. HOW WE SHARE INFORMATION</h2>
          <p>We do not sell your personal information as a standalone product. We may however share information in the following circumstances:</p>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">Service Providers</h3>
          <p>We may share information with trusted third-party service providers that help us operate Rhockstar Connect, such as hosting, database, analytics, authentication, security, communication, payment, and technical service providers. These providers may only process information as necessary to provide their services to us, subject to applicable contractual or legal obligations. The Service Providers shall be personally responsible for any wrong use of information.</p>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">Publicly available information</h3>
          <p>Information that you intentionally make public or share through social, professional, messaging, job, or other platform features may be visible to other users.</p>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">Legal Requirements</h3>
          <p>We may disclose information when we reasonably believe disclosure is necessary to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Comply with applicable law</li>
            <li>Respond to valid legal processes</li>
            <li>Protect the rights, property, or safety of Rhockstar Connect, our users, or others</li>
            <li>Investigate fraud, abuse, security incidents, or violations of our policies</li>
            <li>Enhance business transfers</li>
          </ul>
          <p>Please note that if Rhockstar Connect is involved in a merger, acquisition, restructuring, financing, sale of assets, or similar transaction, personal information may be transferred as part of that transaction, subject to applicable law.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">9. DATA SECURITY</h2>
          <p>We take reasonable technical and organizational measures designed to protect your personal information against unauthorized access, loss, misuse, alteration, or disclosure. However, we do not guarantee 100% security of the Platform or database. You are responsible for keeping your password and account credentials confidential and should promptly notify us if you believe your account has been compromised.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">10. DATA RETENTION</h2>
          <p>We retain personal information as reasonably necessary to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Provide our services</li>
            <li>Maintain your account</li>
            <li>Fulfill the purposes described in this Privacy Policy</li>
            <li>Comply with legal and regulatory obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
            <li>Prevent fraud and abuse</li>
            <li>Maintain security and legitimate business records</li>
          </ul>
          <p>When information is no longer required, we may delete, anonymize, or securely dispose of it, subject to applicable legal requirements.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">11. YOUR PRIVACY CHOICES AND RIGHTS</h2>
          <p>Depending on applicable law, you may have rights regarding your personal information, including the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-400">
            <li>Access your personal information stored on the Platform</li>
            <li>Correct inaccurate information</li>
            <li>Update your account information</li>
            <li>Request deletion of your information</li>
            <li>Request restriction of certain processing</li>
            <li>Object to processing certain information of you</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Manage certain communication preferences</li>
          </ul>
          <p>All requests shall be subject to legal limitations under applicable law.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">12. ACCOUNT DELETION</h2>
          <p>You may request deletion of your Rhockstar Connect account.</p>
          <p>When an account deletion request is processed, we shall delete personal information associated with the account, save for any information we may retain pursuant to any applicable law.</p>
          <p>Please note that some content may remain visible to other users where it has been shared, reposted, or incorporated into other platform features, subject to our applicable policies and technical limitations.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">13. CHILDREN'S PRIVACY</h2>
          <p>Rhockstar Connect is not intended for individuals who are below the minimum age required to legally use the service in their jurisdiction.</p>
          <p>We do not knowingly collect personal information from children in violation of applicable law. We shall not be liable for any collection or processing of any personal of any minor which we had collected or processed due to misrepresentation from the minor or any other person.</p>
          <p>If you believe that a child has provided personal information to us without appropriate authorization, please contact us so we may take appropriate action.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">14. THIRD-PARTY SERVICES AND LINKS</h2>
          <p>Rhockstar Connect may contain links to third-party websites, applications, services, or platforms.</p>
          <p>We are not responsible for the privacy practices, security, content, or policies of third parties.</p>
          <p>You are under obligation to review the privacy policy of any third-party service providers before providing them with personal information.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">15. INTERNATIONAL DATA TRANSFERS</h2>
          <p>Depending on where our service providers and technical infrastructure are located, your information may be processed or stored in countries other than the country in which you live.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">16. DATA PROTECTION AND NIGERIAN LAW</h2>
          <p>Rhockstar Connect is intended to operate in compliance with applicable Nigerian data protection and privacy laws.</p>
          <p>Where applicable, we will comply with the Nigeria Data Protection Act 2023 (NDPA) and regulations, guidance, and requirements issued by the relevant Nigerian data protection authorities.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">17. CHANGES TO THIS PRIVACY POLICY</h2>
          <p>We may, unilaterally, update this Privacy Policy from time to time to reflect changes to our services, technology, legal requirements, or privacy practices.</p>
          <p>When we make material changes, we may provide notice through the platform, by email, or through another appropriate method.</p>
          <p>The "Last Updated" date at the top of this Privacy Policy indicates the date when this Privacy Policy was most recently revised and shall be applicable from the date of such update.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">18. CONTACT US</h2>
          <p>If you have questions, concerns, complaints, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
            <p><strong>Rhockstar Connect</strong></p>
            <p>Website: <a href="https://www.rhockstarconnect.com" className="text-brand hover:underline">www.rhockstarconnect.com</a></p>
            <p>Email: <a href="mailto:rhockstarconnect@gmail.com" className="text-brand hover:underline">rhockstarconnect@gmail.com</a></p>
          </div>
          <p>We will make reasonable efforts to respond to privacy requests as swift as practicably possible on our end.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">19. ACCEPTANCE</h2>
          <p>By creating an account or using Rhockstar Connect, you acknowledge that you have read, understood and agreed to be bound by this Privacy Policy.</p>
          <p>If you do not agree with this Privacy Policy, please do not use Rhockstar Connect.</p>
        </div>
      </main>
    </div>
  );
}
