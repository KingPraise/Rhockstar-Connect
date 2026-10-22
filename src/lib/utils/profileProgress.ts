export interface ProfileProgress {
  percentage: number;
  missingItems: string[];
}

export interface MissingFieldDetail {
  key: string;
  label: string;
  description: string;
}

export interface JobApplicationReadiness {
  canApply: boolean;
  percentage: number;
  missingFields: MissingFieldDetail[];
}

export const calculateProfileProgress = (profile: any): ProfileProgress => {
  if (!profile) return { percentage: 0, missingItems: ['Sign in to track progress'] };

  let score = 0;
  const maxScore = 100;
  const missingItems: string[] = [];

  // Weights for different profile fields aligned with Rhockstar Connect UserProfile
  const fields = [
    { key: 'avatar', weight: 15, label: 'Add a profile photo' },
    { key: 'headline', weight: 20, label: 'Add a professional headline' },
    { key: 'bio', weight: 20, label: 'Write a bio/about section' },
    { key: 'location', weight: 15, label: 'Add your location' },
    { key: 'skills', weight: 15, label: 'Add top skills', isArray: true },
    { key: 'education', weight: 10, label: 'Add education details' },
    { key: 'resumeUrl', weight: 5, label: 'Upload your resume or links', fallbackKey: 'socialLinks' }
  ];

  fields.forEach(field => {
    if (field.isArray) {
      if (profile[field.key] && Array.isArray(profile[field.key]) && profile[field.key].length > 0) {
        score += field.weight;
      } else {
        missingItems.push(field.label);
      }
    } else if (field.fallbackKey && (profile[field.key] || (profile[field.fallbackKey] && Object.keys(profile[field.fallbackKey]).length > 0))) {
      score += field.weight;
    } else {
      if (profile[field.key] && typeof profile[field.key] === 'string' && profile[field.key].trim().length > 0) {
        score += field.weight;
      } else if (profile[field.key] && typeof profile[field.key] === 'object' && Object.keys(profile[field.key]).length > 0) {
        // e.g. location object { city, state, country }
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

/**
 * Checks whether the user's profile is complete enough to apply for jobs.
 * Enforces the rule: "Please update your profiles before applying for our jobs."
 */
export const checkJobApplicationReadiness = (profile: any): JobApplicationReadiness => {
  if (!profile) {
    return {
      canApply: false,
      percentage: 0,
      missingFields: [
        {
          key: 'auth',
          label: 'Account Required',
          description: 'Please sign in or create an account to apply for jobs.'
        }
      ]
    };
  }

  const missing: MissingFieldDetail[] = [];

  // 1. Headline / Professional Role
  const hasHeadline = typeof profile.headline === 'string' && profile.headline.trim().length > 0;
  if (!hasHeadline) {
    missing.push({
      key: 'headline',
      label: 'Professional Headline',
      description: 'Employers need to know your title or specialty (e.g., Full-Stack Engineer, Product Designer).'
    });
  }

  // 2. Bio / Summary
  const hasBio = typeof profile.bio === 'string' && profile.bio.trim().length >= 10;
  if (!hasBio) {
    missing.push({
      key: 'bio',
      label: 'Bio / About Summary',
      description: 'A brief summary of your experience and background (at least 10 characters).'
    });
  }

  // 3. Location
  const hasLocation = Boolean(
    (typeof profile.location === 'string' && profile.location.trim().length > 0) ||
    (profile.location && typeof profile.location === 'object' && (profile.location.city || profile.location.country))
  );
  if (!hasLocation) {
    missing.push({
      key: 'location',
      label: 'Location (City / Country)',
      description: 'Employers require your location to assess work permits and timezone fit.'
    });
  }

  // 4. Skills
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  if (!hasSkills) {
    missing.push({
      key: 'skills',
      label: 'Top Skills (at least 1)',
      description: 'Add the core technologies, tools, or domain skills you specialize in.'
    });
  }

  const progress = calculateProfileProgress(profile);

  return {
    canApply: missing.length === 0,
    percentage: progress.percentage,
    missingFields: missing
  };
};
