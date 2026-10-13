import { JobListing } from "../services/jobs";

export const calculateJobMatchScore = (job: JobListing, userSkills?: string[]): number => {
  if (!userSkills || userSkills.length === 0) {
    return 50; // Baseline score for users with no skills listed
  }

  const jobText = `${job.title} ${job.description} ${job.type} ${job.company}`.toLowerCase();
  
  let matchCount = 0;
  
  userSkills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchCount++;
    }
  });

  // Calculate percentage
  let matchPercentage = Math.round((matchCount / userSkills.length) * 100);
  
  // Give a small boost if job title matches a skill exactly (very relevant)
  userSkills.forEach(skill => {
    if (job.title.toLowerCase().includes(skill.toLowerCase())) {
      matchPercentage += 15;
    }
  });
  
  // Floor at 40%, Cap at 98% (never truly 100% perfect match without human review)
  if (matchPercentage > 98) matchPercentage = 98;
  if (matchPercentage < 40) matchPercentage = 40;
  
  return matchPercentage;
};
