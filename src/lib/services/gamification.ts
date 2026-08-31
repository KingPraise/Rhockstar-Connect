import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  increment
} from 'firebase/firestore';

export type StardomRank = 
  | 'Explorer' 
  | 'Insider' 
  | 'Connector' 
  | 'Buzzmaker' 
  | 'Trendsetter' 
  | 'Influencer' 
  | 'Superstar' 
  | 'Rhockstar';

export interface StardomTierInfo {
  rank: StardomRank;
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  badge: string;
  icon: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export const STARDOM_TIERS: StardomTierInfo[] = [
  {
    rank: 'Explorer',
    level: 1,
    minXP: 0,
    maxXP: 199,
    title: 'Explorer',
    badge: '🧭',
    icon: 'Compass',
    color: '#94a3b8',
    bgGradient: 'from-slate-700 to-slate-800',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-300',
    description: 'New member exploring communities and connecting across the platform',
  },
  {
    rank: 'Insider',
    level: 2,
    minXP: 200,
    maxXP: 499,
    title: 'Insider',
    badge: '⚡',
    icon: 'Zap',
    color: '#38bdf8',
    bgGradient: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-400/40',
    textColor: 'text-sky-400',
    description: 'Active contributor sharing ideas and engaging regularly in communities',
  },
  {
    rank: 'Connector',
    level: 3,
    minXP: 500,
    maxXP: 999,
    title: 'Connector',
    badge: '🔗',
    icon: 'Link',
    color: '#2dd4bf',
    bgGradient: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-400/40',
    textColor: 'text-teal-400',
    description: 'Master networker building valuable relationships and active chats',
  },
  {
    rank: 'Buzzmaker',
    level: 4,
    minXP: 1000,
    maxXP: 1999,
    title: 'Buzzmaker',
    badge: '📢',
    icon: 'Megaphone',
    color: '#10b981',
    bgGradient: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-400/40',
    textColor: 'text-emerald-400',
    description: 'Engagement driver creating viral discussions and lively threads',
  },
  {
    rank: 'Trendsetter',
    level: 5,
    minXP: 2000,
    maxXP: 3999,
    title: 'Trendsetter',
    badge: '🚀',
    icon: 'Rocket',
    color: '#a855f7',
    bgGradient: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400/40',
    textColor: 'text-purple-400',
    description: 'High-impact content creator whose posts shape platform discussions',
  },
  {
    rank: 'Influencer',
    level: 6,
    minXP: 4000,
    maxXP: 7499,
    title: 'Influencer',
    badge: '💫',
    icon: 'Sparkles',
    color: '#f43f5e',
    bgGradient: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-400/40',
    textColor: 'text-rose-400',
    description: 'Respected community leader with significant influence and following',
  },
  {
    rank: 'Superstar',
    level: 7,
    minXP: 7500,
    maxXP: 14999,
    title: 'Superstar',
    badge: '🌟',
    icon: 'Star',
    color: '#f59e0b',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-400/40',
    textColor: 'text-amber-400',
    description: 'Platform elite recognized for consistent daily value and long streaks',
  },
  {
    rank: 'Rhockstar',
    level: 8,
    minXP: 15000,
    maxXP: 999999,
    title: 'Rhockstar',
    badge: '👑✨',
    icon: 'Crown',
    color: '#e2e8f0',
    bgGradient: 'from-violet-500 via-brand to-cyan-400',
    borderColor: 'border-brand/60',
    textColor: 'text-brand',
    description: 'Legendary status: highest honor in the Rhockstar-Connect ecosystem',
  },
];

export interface StardomProgress {
  currentTier: StardomTierInfo;
  nextTier: StardomTierInfo | null;
  currentXP: number;
  xpInCurrentTier: number;
  xpRequiredForCurrentTier: number;
  progressPercent: number;
  isMaxRank: boolean;
}

export function calculateStardom(totalXP: number = 0): StardomProgress {
  const validXP = Math.max(0, totalXP || 0);

  let currentTierIndex = 0;
  for (let i = STARDOM_TIERS.length - 1; i >= 0; i--) {
    if (validXP >= STARDOM_TIERS[i].minXP) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = STARDOM_TIERS[currentTierIndex];
  const isMaxRank = currentTierIndex === STARDOM_TIERS.length - 1;
  const nextTier = isMaxRank ? null : STARDOM_TIERS[currentTierIndex + 1];

  let xpInCurrentTier = validXP - currentTier.minXP;
  let xpRequiredForCurrentTier = nextTier ? nextTier.minXP - currentTier.minXP : 1;
  let progressPercent = isMaxRank 
    ? 100 
    : Math.min(100, Math.max(0, Math.floor((xpInCurrentTier / xpRequiredForCurrentTier) * 100)));

  return {
    currentTier,
    nextTier,
    currentXP: validXP,
    xpInCurrentTier,
    xpRequiredForCurrentTier,
    progressPercent,
    isMaxRank,
  };
}

export type ActivityAction = 
  | 'daily_checkin' 
  | 'send_message' 
  | 'create_post' 
  | 'receive_reaction' 
  | 'community_comment' 
  | 'referral_success'
  | 'join_community';

export interface ActionXPConfig {
  baseXP: number;
  maxPerDay?: number;
  maxPerHour?: number;
  cooldownMs?: number;
}

export const ACTION_XP_CONFIGS: Record<ActivityAction, ActionXPConfig> = {
  daily_checkin: { baseXP: 25, maxPerDay: 1 },
  send_message: { baseXP: 2, maxPerHour: 10 },
  create_post: { baseXP: 20, maxPerDay: 3 },
  receive_reaction: { baseXP: 5, maxPerDay: 20 },
  community_comment: { baseXP: 10, maxPerDay: 10 },
  referral_success: { baseXP: 50 },
  join_community: { baseXP: 15, maxPerDay: 2 },
};

export function getStreakMultiplier(streakCount: number = 1): number {
  if (streakCount >= 30) return 1.5;
  if (streakCount >= 7) return 1.25;
  if (streakCount >= 3) return 1.1;
  return 1.0;
}

const rateLimitCache: Record<string, { countToday: number; countThisHour: number; lastActionTime: number; dateStr: string; hourStr: string }> = {};

function checkRateLimit(userId: string, action: ActivityAction): boolean {
  const config = ACTION_XP_CONFIGS[action];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hourStr = `${dateStr}-${now.getHours()}`;
  const key = `${userId}:${action}`;

  if (!rateLimitCache[key]) {
    rateLimitCache[key] = { countToday: 0, countThisHour: 0, lastActionTime: 0, dateStr, hourStr };
  }

  const record = rateLimitCache[key];

  if (record.dateStr !== dateStr) {
    record.dateStr = dateStr;
    record.countToday = 0;
  }

  if (record.hourStr !== hourStr) {
    record.hourStr = hourStr;
    record.countThisHour = 0;
  }

  if (config.maxPerDay && record.countToday >= config.maxPerDay) {
    return false;
  }
  if (config.maxPerHour && record.countThisHour >= config.maxPerHour) {
    return false;
  }
  if (config.cooldownMs && (Date.now() - record.lastActionTime) < config.cooldownMs) {
    return false;
  }

  record.countToday++;
  record.countThisHour++;
  record.lastActionTime = Date.now();
  return true;
}

export async function awardUserXP(
  userId: string, 
  action: ActivityAction,
  customMultiplier: number = 1
): Promise<{ success: boolean; xpEarned: number; newTotalXP?: number; leveledUp?: boolean; oldRank?: StardomRank; newRank?: StardomRank }> {
  try {
    if (!userId) return { success: false, xpEarned: 0 };

    if (!checkRateLimit(userId, action)) {
      return { success: false, xpEarned: 0 };
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, xpEarned: 0 };

    const userData = userSnap.data();
    const currentXP = Number(userData.stardomXP || 0);
    const currentStreak = Number(userData.streakCount || 1);
    
    const config = ACTION_XP_CONFIGS[action];
    const streakMult = getStreakMultiplier(currentStreak);
    const xpEarned = Math.round(config.baseXP * streakMult * customMultiplier);

    const newTotalXP = currentXP + xpEarned;
    const oldStardom = calculateStardom(currentXP);
    const newStardom = calculateStardom(newTotalXP);
    const leveledUp = oldStardom.currentTier.level < newStardom.currentTier.level;

    await updateDoc(userRef, {
      stardomXP: increment(xpEarned),
      stardomRank: newStardom.currentTier.rank,
      lastActiveDate: new Date().toISOString(),
    });

    return {
      success: true,
      xpEarned,
      newTotalXP,
      leveledUp,
      oldRank: oldStardom.currentTier.rank,
      newRank: newStardom.currentTier.rank,
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false, xpEarned: 0 };
  }
}

export async function checkDailyStreak(userId: string): Promise<{ streakCount: number; isNewDay: boolean }> {
  try {
    if (!userId) return { streakCount: 1, isNewDay: false };

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { streakCount: 1, isNewDay: false };

    const userData = userSnap.data();
    const lastActive = userData.lastActiveDate ? new Date(userData.lastActiveDate) : null;
    const currentStreak = Number(userData.streakCount || 0);
    const longestStreak = Number(userData.longestStreak || 0);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!lastActive) {
      await updateDoc(userRef, {
        streakCount: 1,
        longestStreak: Math.max(1, longestStreak),
        lastActiveDate: now.toISOString(),
      });
      await awardUserXP(userId, 'daily_checkin');
      return { streakCount: 1, isNewDay: true };
    }

    const lastActiveStr = lastActive.toISOString().split('T')[0];
    if (lastActiveStr === todayStr) {
      return { streakCount: currentStreak || 1, isNewDay: false };
    }

    const diffMs = now.getTime() - lastActive.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let newStreak = 1;
    if (diffHours <= 48) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }

    await updateDoc(userRef, {
      streakCount: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActiveDate: now.toISOString(),
    });

    await awardUserXP(userId, 'daily_checkin');
    return { streakCount: newStreak, isNewDay: true };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { streakCount: 1, isNewDay: false };
  }
}

export interface LeaderboardUser {
  uid: string;
  fullName: string;
  username: string;
  avatar: string;
  stardomXP: number;
  stardomRank: StardomRank;
  streakCount: number;
}

export function subscribeToLeaderboard(callback: (users: LeaderboardUser[]) => void) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('stardomXP', 'desc'), limit(15));

  return onSnapshot(q, (snapshot) => {
    const list: LeaderboardUser[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        uid: docSnap.id,
        fullName: d.fullName || 'Member',
        username: d.username || '',
        avatar: d.avatar || '',
        stardomXP: Number(d.stardomXP || 0),
        stardomRank: (d.stardomRank as StardomRank) || 'Explorer',
        streakCount: Number(d.streakCount || 0),
      });
    });
    callback(list);
  }, (err) => {
    console.error('Leaderboard subscription error:', err);
    callback([]);
  });
}
