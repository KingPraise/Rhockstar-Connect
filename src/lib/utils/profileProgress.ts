export interface ProfileProgress {
  percentage: number;
  missingItems: string[];
}

export const calculateProfileProgress = (profile: any): ProfileProgress => {
  if (!profile) return { percentage: 0, missingItems: ['Sign in to track progress'] };

  let score = 0;
  const maxScore = 100;
  const missingItems: string[] = [];

  // Weights for different profile fields
  const fields = [
    { key: 'avatar', weight: 15, label: 'Add a profile photo' },
    { key: 'headline', weight: 15, label: 'Add a professional headline' },
    { key: 'bio', weight: 20, label: 'Write a bio/about section' },
    { key: 'location', weight: 10, label: 'Add your location' },
    { key: 'skills', weight: 15, label: 'Add top skills', isArray: true },
    { key: 'experience', weight: 15, label: 'Add work experience', isArray: true },
    { key: 'education', weight: 10, label: 'Add education details' }
  ];

  fields.forEach(field => {
    if (field.isArray) {
      if (profile[field.key] && Array.isArray(profile[field.key]) && profile[field.key].length > 0) {
        score += field.weight;
      } else {
        missingItems.push(field.label);
      }
    } else {
      if (profile[field.key] && typeof profile[field.key] === 'string' && profile[field.key].trim().length > 0) {
        score += field.weight;
      } else if (profile[field.key] && typeof profile[field.key] === 'object') {
        // e.g. location object
        score += field.weight;
      } else {
        missingItems.push(field.label);
      }
    }
  });

  return {
    percentage: Math.min(score, maxScore),
    missingItems
  };
};
