
import { Portfolio, Contest, GameRoom } from '../types';

export const INITIAL_PORTFOLIOS: Portfolio[] = [
  {
    id: 'p1',
    kolName: 'Sarah Tradez',
    kolAvatar: 'https://i.pravatar.cc/150?u=sarah',
    isVerified: true,
    title: 'AI Revolution Only',
    description: 'Focused on the backbone of the AI boom.',
    stocks: [
      { ticker: 'NVDA', name: 'NVIDIA', price: 0, changePercent: 0 },
      { ticker: 'AMD', name: 'AMD', price: 0, changePercent: 0 },
      { ticker: 'MSFT', name: 'Microsoft', price: 0, changePercent: 0 },
      { ticker: 'GOOGL', name: 'Alphabet', price: 0, changePercent: 0 },
    ],
    totalReturn: 0,
    backers: 1420,
    expiry: '1 Day',
    roomId: 'gr1'
  },
  {
    id: 'p2',
    kolName: 'Crypto King',
    kolAvatar: 'https://i.pravatar.cc/150?u=crypto',
    isVerified: true,
    title: 'High Volatility Plays',
    description: 'High risk tech and crypto proxies.',
    stocks: [
      { ticker: 'COIN', name: 'Coinbase', price: 0, changePercent: 0 },
      { ticker: 'TSLA', name: 'Tesla', price: 0, changePercent: 0 },
      { ticker: 'NVDA', name: 'NVIDIA', price: 0, changePercent: 0 },
      { ticker: 'AMD', name: 'AMD', price: 0, changePercent: 0 },
    ],
    totalReturn: 0,
    backers: 850,
    expiry: '1 Month',
    roomId: 'gr2'
  },
  {
    id: 'p4',
    kolName: 'Solar Steve',
    kolAvatar: 'https://i.pravatar.cc/150?u=steve',
    isVerified: true,
    title: 'Sun & Wind Growth',
    description: 'Riding the renewable energy wave.',
    stocks: [
      { ticker: 'FSLR', name: 'First Solar', price: 0, changePercent: 0 },
      { ticker: 'ENPH', name: 'Enphase', price: 0, changePercent: 0 },
      { ticker: 'NEE', name: 'NextEra', price: 0, changePercent: 0 },
      { ticker: 'TSLA', name: 'Tesla', price: 0, changePercent: 0 },
    ],
    totalReturn: 0,
    backers: 920,
    expiry: '1 Week',
    roomId: 'gr3'
  },
  {
    id: 'p5',
    kolName: 'DeepValue',
    kolAvatar: 'https://i.pravatar.cc/150?u=deep',
    isVerified: false,
    title: 'Meme Lords Deluxe',
    description: 'Diamond hands only. To the moon.',
    stocks: [
      { ticker: 'GME', name: 'GameStop', price: 0, changePercent: 0 },
      { ticker: 'AMC', name: 'AMC', price: 0, changePercent: 0 },
      { ticker: 'PLTR', name: 'Palantir', price: 0, changePercent: 0 },
      { ticker: 'BB', name: 'BlackBerry', price: 0, changePercent: 0 },
    ],
    totalReturn: 0,
    backers: 4500,
    expiry: '1 Day',
    roomId: 'gr2'
  },
  {
    id: 'p3',
    kolName: 'Value Victor',
    kolAvatar: 'https://i.pravatar.cc/150?u=victor',
    isVerified: true,
    title: 'Safe Harbor Tech',
    description: 'Mega-cap stability for uncertain times.',
    stocks: [
      { ticker: 'AAPL', name: 'Apple', price: 0, changePercent: 0 },
      { ticker: 'MSFT', name: 'Microsoft', price: 0, changePercent: 0 },
      { ticker: 'AMZN', name: 'Amazon', price: 0, changePercent: 0 },
      { ticker: 'GOOGL', name: 'Alphabet', price: 0, changePercent: 0 },
    ],
    totalReturn: 0,
    backers: 2100,
    expiry: '1 Year',
    roomId: 'gr1'
  }
];

export const CONTEST_LOBBY: Contest[] = [
  {
    id: 'c1',
    title: 'Daily Sprint',
    description: 'Fast-paced action. Highest intraday gainer wins.',
    prize: '$1,000',
    expiry: '1 Day',
    color: 'bg-orange-600',
    icon: 'Zap'
  },
  {
    id: 'c2',
    title: 'Monthly Marathon',
    description: 'Strategy pays off. Best 30-day performance.',
    prize: '$5,000',
    expiry: '1 Month',
    color: 'bg-blue-600',
    icon: 'Trophy'
  },
  {
    id: 'c3',
    title: 'Legends League',
    description: 'For the long-term visionaries. High stakes.',
    prize: '$50,000',
    expiry: '1 Year',
    color: 'bg-purple-600',
    icon: 'Crown'
  }
];

export const MOCK_GAME_ROOMS: GameRoom[] = [
  {
    id: 'gr1',
    name: 'Tech Titans',
    description: 'Exclusive circle for high-growth software and hardware enthusiasts.',
    avatar: 'https://i.pravatar.cc/150?u=tech',
    isPrivate: false,
    memberCount: 5402,
    portfolioCount: 2,
    contestId: 'c1'
  },
  {
    id: 'gr2',
    name: 'WallStreetBetz Elite',
    description: 'High stakes, high energy. Only for those who can handle the heat.',
    avatar: 'https://i.pravatar.cc/150?u=wsb',
    isPrivate: true,
    memberCount: 1205,
    portfolioCount: 2,
    contestId: 'c2'
  },
  {
    id: 'gr3',
    name: 'Green Energy Hub',
    description: 'Focused on sustainable investing and future energy technologies.',
    avatar: 'https://i.pravatar.cc/150?u=green',
    isPrivate: false,
    memberCount: 3210,
    portfolioCount: 1,
    contestId: 'c1'
  },
  {
    id: 'gr4',
    name: 'Dividend Kings',
    description: 'The slow and steady path. Cash flow strategies for long-term holders.',
    avatar: 'https://i.pravatar.cc/150?u=dividend',
    isPrivate: false,
    memberCount: 8900,
    portfolioCount: 0,
    contestId: 'c3'
  }
];
