export interface ParsedJobData {
  title: string;
  company?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  salary: string;
  description: string;
  contactEmail?: string;
  applicationUrl?: string;
}

/**
 * Intelligent client-side heuristic parser that parses raw job postings
 * (e.g. from WhatsApp, LinkedIn, email, PDF/text documents) into structured job fields.
 */
export function parseJobListingText(rawText: string): ParsedJobData {
  if (!rawText || typeof rawText !== 'string') {
    return {
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
    };
  }

  const cleanText = rawText.trim();
  const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let title = '';
  let company = '';
  let location = '';
  let salary = '';
  let type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship' = 'Full-time';
  let contactEmail = '';
  let applicationUrl = '';

  // 1. Extract Email and URLs if any
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    contactEmail = emailMatch[0];
  }

  const urlMatch = cleanText.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) {
    applicationUrl = urlMatch[0];
  }

  // 2. Scan lines for explicit key-value headers
  for (const line of lines) {
    // Title patterns
    if (!title) {
      const titleMatch = line.match(/^(?:Hiring|Job Title|Role|Position|Vacancy)\s*[:\-–—]\s*(.+)$/i);
      if (titleMatch) {
        let extractedTitle = titleMatch[1].trim();
        // Check if "at Company" is embedded in title line, e.g. "Business Development Associate at Rainha Hair"
        const atCompanyMatch = extractedTitle.match(/^(.+?)\s+(?:at|@)\s+([A-Za-z0-9&.,' -]+)$/i);
        if (atCompanyMatch) {
          title = atCompanyMatch[1].trim();
          if (!company) company = atCompanyMatch[2].trim();
        } else {
          title = extractedTitle;
        }
      }
    }

    // Company patterns
    if (!company) {
      const companyMatch = line.match(/^(?:Company|Organization|Employer|Client)\s*[:\-–—]\s*(.+)$/i);
      if (companyMatch) {
        company = companyMatch[1].trim();
      }
    }

    // Location patterns
    if (!location) {
      const locMatch = line.match(/^(?:Location|Workplace|Where)\s*[:\-–—]\s*(.+)$/i);
      if (locMatch) {
        location = locMatch[1].trim();
      }
    }

    // Salary / Compensation patterns
    if (!salary) {
      const salMatch = line.match(/^(?:Compensation|Salary|Pay|Remuneration|Budget|Package)\s*[:\-–—]\s*(.+)$/i);
      if (salMatch) {
        salary = salMatch[1].trim();
      }
    }

    // Employment Type patterns
    const typeMatch = line.match(/^(?:Employment Type|Job Type|Type)\s*[:\-–—]\s*(.+)$/i);
    if (typeMatch) {
      const rawVal = typeMatch[1].toLowerCase();
      if (/\bpart[\s-]?time\b/i.test(rawVal)) type = 'Part-time';
      else if (/\b(?:contract|freelance)\b/i.test(rawVal)) type = 'Contract';
      else if (/\bintern(?:ship)?s?\b/i.test(rawVal)) type = 'Internship';
      else if (/\bremote\b/i.test(rawVal)) type = 'Remote';
      else if (/\bfull[\s-]?time\b/i.test(rawVal)) type = 'Full-time';
    }
  }

  // 3. Fallbacks if not extracted via headers
  // Fallback for title: Check first line if it looks like a headline (e.g. "Hiring Senior Engineer" or "Lead Product Designer")
  if (!title && lines.length > 0) {
    const firstLine = lines[0];
    const atMatch = firstLine.match(/^(.+?)\s+(?:at|@)\s+([A-Za-z0-9&.,' -]+)$/i);
    if (atMatch) {
      title = atMatch[1].replace(/^(?:Hiring|We're hiring|Open role|Role)[:\s]*/i, '').trim();
      if (!company) company = atMatch[2].trim();
    } else if (firstLine.length < 70 && !firstLine.includes(':') && !firstLine.includes('●')) {
      title = firstLine.replace(/^(?:Hiring|We're hiring|Open role)[:\s]*/i, '').trim();
    }
  }

  // Fallback for salary: Search for currency signs (₦, $, £, €, NGN, USD, GBP, EUR)
  if (!salary) {
    const currencyRegex = /(?:₦|NGN|\$|USD|£|EUR|€)\s*[0-9,kKmM]+(?:\s*[-–—to]+\s*(?:₦|NGN|\$|USD|£|EUR|€)?\s*[0-9,kKmM]+)?(?:\s*(?:per|\/)\s*(?:month|mo|year|yr|annum|hr|hour))?/i;
    const match = cleanText.match(currencyRegex);
    if (match) {
      salary = match[0].trim();
    }
  }

  // Fallback for location: check for common location markers
  if (!location) {
    if (/\b(?:Remote|Worldwide|Global|Anywhere)\b/i.test(cleanText) && !/\b(?:Hybrid|Onsite|In-person)\b/i.test(cleanText)) {
      location = 'Remote';
    } else if (/\bHybrid\b/i.test(cleanText)) {
      const hybridWithCity = cleanText.match(/Hybrid\s*[-–—/]\s*([A-Za-z\s,]+)/i);
      location = hybridWithCity ? `Hybrid / ${hybridWithCity[1].trim()}` : 'Hybrid';
    } else {
      const cityMatch = cleanText.match(/\b(Lagos|Abuja|Port Harcourt|Ibadan|London|New York|Accra|Nairobi|Berlin|Toronto)(?:,\s*[A-Za-z]+)?/i);
      if (cityMatch) {
        location = cityMatch[0].trim();
      }
    }
  }

  // Refine Employment Type based on location or overall text if still default
  if (/\bfull[\s-]?time\b/i.test(cleanText)) {
    type = 'Full-time';
  } else if (/\bpart[\s-]?time\b/i.test(cleanText)) {
    type = 'Part-time';
  } else if (/\b(?:contract|freelance)\b/i.test(cleanText)) {
    type = 'Contract';
  } else if (/\bintern(?:ship)?s?\b/i.test(cleanText)) {
    type = 'Internship';
  } else if ((location.toLowerCase().includes('remote') || /\b100%\s*remote\b/i.test(cleanText)) && !cleanText.toLowerCase().includes('hybrid')) {
    type = 'Remote';
  }

  // 4. Clean description:
  // We format the description nicely. If the text begins with repetitive metadata lines (like "Hiring: ...", "Location: ...", "Compensation: ..."),
  // we keep the overview, responsibilities, requirements, and instructions while preserving all formatting.
  let descriptionLines = [...lines];
  
  // Filter out leading meta lines that are already captured in fields to keep description clean and professional
  let startIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const l = lines[i];
    if (
      l.match(/^(?:Hiring|Job Title|Role|Position|Location|Compensation|Salary|Employment Type|Type|Workplace)\s*[:\-–—]/i) ||
      (i === 0 && l.match(/^Hiring:/i))
    ) {
      startIndex = i + 1;
    } else if (l.length > 0) {
      break;
    }
  }

  const remainingBody = lines.slice(startIndex).join('\n\n');
  const description = remainingBody.trim() || cleanText;

  return {
    title,
    company,
    location,
    type,
    salary,
    description,
    contactEmail,
    applicationUrl,
  };
}
