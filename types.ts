export interface Stock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
}

export interface Portfolio {
  id: string;
  kolName: string;
  kolAvatar: string;
  title: string;
  description: string;
  stocks: Stock[]; // Always 4 stocks
  expiry: '1 Day' | '1 Month' | '3 Months' | '1 Year';
  totalReturn: number;
  backers: number;
  isVerifiedKOL: boolean;
}

export interface GameRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  portfolioCount: number;
  isPrivate: boolean;
  avatar: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  avgPrice: number;
  quantity: number;
  currentPrice?: number;
  dayChange?: number; // Dollar amount change today
  dayChangePercent?: number; // Percent change today
}

export interface UserStats {
  lastLoginDate: string;
  streakDays: number;
  totalEarnings: number;
}

export interface User {
  id: string;
  username: string;
  virtualBalance: number;
  isKOL: boolean;
  watchlist: WatchlistItem[];
  activeBacking: string[]; // IDs of backed portfolios
  stats: UserStats;
}

export enum View {
  HOME = 'HOME',
  CONTESTS = 'CONTESTS',
  WATCHLIST = 'WATCHLIST',
  ADMIN = 'ADMIN',
  KOL_CREATE = 'KOL_CREATE'
}

export interface ChartDataPoint {
  time: string;
  value: number;
}