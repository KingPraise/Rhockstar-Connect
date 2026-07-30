import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

export interface JobListing {
  id: string;
  title: string;
  company: string; // The company name
  companyId?: string; // The UID of the employer who posted this
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salary: string;
  description: string;
  postedAt: any;
  logo: string;
}

// Keep mock jobs as a fallback/seed
const MOCK_JOBS: JobListing[] = [
  {
    id: "job_1",
    title: "Senior Product Designer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$160k - $210k",
    description: "We are looking for a Senior Product Designer to help shape the future of economic infrastructure. You will work closely with product managers and engineers to craft elegant, user-centric solutions.",
    postedAt: "2 days ago",
    logo: "S"
  },
  {
    id: "job_2",
    title: "Lead Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    type: "Remote",
    salary: "$180k - $230k",
    description: "Join our core team to build the future of the Web. You'll be working on cutting-edge React features, Next.js integrations, and edge computing architectures.",
    postedAt: "1 day ago",
    logo: "V"
  },
  {
    id: "job_3",
    title: "Head of Marketing",
    company: "Linear",
    location: "New York, NY",
    type: "Full-time",
    salary: "$150k - $190k",
    description: "Lead our go-to-market strategies and brand messaging. We're looking for someone with a proven track record in B2B SaaS growth.",
    postedAt: "5 hours ago",
    logo: "L"
  },
  {
    id: "job_4",
    title: "Smart Contract Developer",
    company: "OpenSea",
    location: "Remote",
    type: "Contract",
    salary: "$120/hr",
    description: "Looking for an experienced Solidity developer to audit and deploy our next-generation marketplace contracts.",
    postedAt: "3 days ago",
    logo: "O"
  },
  {
    id: "job_5",
    title: "Marketing Intern",
    company: "Figma",
    location: "Remote",
    type: "Internship",
    salary: "$30/hr",
    description: "Join our marketing team for the summer! Help us create engaging content and manage social media campaigns.",
    postedAt: "12 hours ago",
    logo: "F"
  },
  {
    id: "job_6",
    title: "Data Analyst",
    company: "Spotify",
    location: "Stockholm, Sweden",
    type: "Part-time",
    salary: "$80k - $100k (Pro-rated)",
    description: "Analyze listening trends and help our product teams make data-driven decisions. 20 hours per week.",
    postedAt: "4 days ago",
    logo: "Sp"
  }
];

export interface JobFilters {
  query?: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship' | 'All';
  companyId?: string;
  limitCount?: number;
}

export const createJob = async (jobData: Omit<JobListing, "id" | "postedAt" | "logo">, employerId: string) => {
  try {
    const jobsRef = collection(db, "jobs");
    const newJobRef = doc(jobsRef);
    
    const employerDoc = await getDoc(doc(db, "users", employerId));
    const employerData = employerDoc.data();
    
    let logo = employerData?.fullName?.substring(0, 1).toUpperCase() || "B";
    if (employerData?.avatar) {
      logo = employerData.avatar;
    }

    const job: JobListing = {
      ...jobData,
      id: newJobRef.id,
      companyId: employerId,
      postedAt: serverTimestamp(),
      logo
    };

    await setDoc(newJobRef, job);
    return { success: true, job };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getJobs = async (filters?: JobFilters): Promise<{ success: boolean; jobs?: JobListing[]; error?: string }> => {
  try {
    const jobsRef = collection(db, "jobs");
    // Sort by newest first
    let q = query(jobsRef, orderBy("postedAt", "desc"));
    if (filters?.limitCount) {
      q = query(jobsRef, orderBy("postedAt", "desc"), limit(filters.limitCount));
    }
    const snapshot = await getDocs(q);
    
    let fetchedJobs: JobListing[] = [];
    
    if (!snapshot.empty) {
      fetchedJobs = snapshot.docs.map(doc => {
        const data = doc.data();
        let postedAtStr = "Just now";
        if (data.postedAt?.toDate) {
          const diffDays = Math.floor((new Date().getTime() - data.postedAt.toDate().getTime()) / (1000 * 3600 * 24));
          if (diffDays === 0) postedAtStr = "Today";
          else if (diffDays === 1) postedAtStr = "1 day ago";
          else postedAtStr = `${diffDays} days ago`;
        }
        return {
          ...data,
          id: doc.id,
          postedAt: postedAtStr
        } as JobListing;
      });
    }
    
    // Apply filters
    if (filters) {
      if (filters.query) {
        const qStr = filters.query.toLowerCase();
        fetchedJobs = fetchedJobs.filter(job => 
          job.title.toLowerCase().includes(qStr) || 
          job.company.toLowerCase().includes(qStr)
        );
      }
      
      if (filters.type && filters.type !== 'All') {
        fetchedJobs = fetchedJobs.filter(job => job.type === filters.type);
      }

      if (filters.companyId) {
        fetchedJobs = fetchedJobs.filter(job => job.companyId === filters.companyId);
      }
    }
    
    return { success: true, jobs: fetchedJobs };
  } catch {
    return { success: false, error: "Failed to fetch jobs" };
  }
};
