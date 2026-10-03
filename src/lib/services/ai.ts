/**
 * Rhockstar AI Service Utility
 * Provides AI persona assistance and candidate-job matching algorithms.
 */

export type AIPersona = 'career' | 'dating' | 'business';

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface CandidateProfile {
  skills?: string[];
  experienceLevel?: string;
  headline?: string;
}

export interface JobListing {
  title: string;
  skillsRequired?: string[];
  description: string;
}

export async function getAIResponse(personaOrPrompt: string, prompt?: string): Promise<string> {
  const targetPersona = prompt ? (personaOrPrompt as AIPersona) : 'career';
  
  if (targetPersona === 'dating') {
    return `Based on your profile, here is advice for authentic connections: Keep your bio genuine, highlight your passions, and start conversations with open-ended questions about shared interests!`;
  }
  if (targetPersona === 'business') {
    return `To elevate your business on Rhockstar Connect: Highlight your key services, create sponsored ad campaigns for target audiences, and engage in topic communities to build trust.`;
  }
  return `To optimize your career profile: Tailor your headline with key technical skills, share insights in the Feed, and apply to job listings with high AI match scores!`;
}

/**
 * Calculates a match percentage (0-100%) between a candidate profile and job requirements.
 */
export function calculateJobMatchScore(candidate: CandidateProfile, job: JobListing): number {
  if (!job.skillsRequired || job.skillsRequired.length === 0) return 85;
  if (!candidate.skills || candidate.skills.length === 0) return 60;

  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const requiredSkillsLower = job.skillsRequired.map(s => s.toLowerCase());

  let matches = 0;
  for (const skill of requiredSkillsLower) {
    if (candidateSkillsLower.some(cs => cs.includes(skill) || skill.includes(cs))) {
      matches++;
    }
  }

  const skillScore = (matches / requiredSkillsLower.length) * 70;
  const baseBonus = 25;
  return Math.min(100, Math.round(skillScore + baseBonus));
}
