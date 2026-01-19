
export interface Stock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export interface Portfolio {
  id: string;
  kolName: string;
  kolAvatar: string;
  isVerified: boolean;
  title: string;
  description: string;
  stocks: Stock[];
  totalReturn: number;
  backers: number;
  expiry: string;
  roomId?: string; // Optional association with a game room
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  currentPrice?: number;
  dayChangePercent?: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface GameRoom {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isPrivate: boolean;
  memberCount: number;
  portfolioCount: number;
  contestId?: string; // Associates room with a contest like 'c1', 'c2', 'c3'
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  prize: string;
  expiry: string;
  color: string;
  icon: string;
}

export enum View {
  HOME = 'HOME',
  DISCOVER = 'DISCOVER',
  CONTESTS = 'CONTESTS',
  WATCHLIST = 'WATCHLIST',
  ADMIN = 'ADMIN'
}
