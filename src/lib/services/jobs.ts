export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  description: string;
  postedAt: string;
  logo: string;
}

// Mock database of premium jobs
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
  }
];

export const getJobs = async (searchQuery?: string): Promise<{ success: boolean; jobs?: JobListing[]; error?: string }> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredJobs = MOCK_JOBS;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredJobs = MOCK_JOBS.filter(job => 
        job.title.toLowerCase().includes(q) || 
        job.company.toLowerCase().includes(q)
      );
    }
    
    return { success: true, jobs: filteredJobs };
  } catch {
    return { success: false, error: "Failed to fetch jobs" };
  }
};
