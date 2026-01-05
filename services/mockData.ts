import { Stock, Portfolio, ChartDataPoint, GameRoom } from '../types';

export const MOCK_STOCKS: Stock[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 890.50, changePercent: 2.4 },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 175.30, changePercent: -1.2 },
  { ticker: 'AAPL', name: 'Apple Inc', price: 169.80, changePercent: 0.5 },
  { ticker: 'AMD', name: 'Adv Micro Devices', price: 180.20, changePercent: 3.1 },
  { ticker: 'AMZN', name: 'Amazon.com', price: 180.10, changePercent: 1.1 },
  { ticker: 'GOOGL', name: 'Alphabet Inc', price: 155.40, changePercent: 0.8 },
  { ticker: 'MSFT', name: 'Microsoft Corp', price: 420.50, changePercent: 0.2 },
  { ticker: 'COIN', name: 'Coinbase Global', price: 245.80, changePercent: 5.4 },
];

export const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: 'p1',
    kolName: 'Sarah Tradez',
    kolAvatar: 'https://picsum.photos/100/100?random=1',
    title: 'AI Revolution Only',
    description: 'Betting big on the chip shortage recovery and AI infrastructure.',
    stocks: [MOCK_STOCKS[0], MOCK_STOCKS[3], MOCK_STOCKS[6], MOCK_STOCKS[5]],
    expiry: '1 Day',
    totalReturn: 1.8,
    backers: 1420,
    isVerifiedKOL: true,
  },
  {
    id: 'p2',
    kolName: 'Crypto King',
    kolAvatar: 'https://picsum.photos/100/100?random=2',
    title: 'High Volatility Plays',
    description: 'Tech and crypto proxies for the brave.',
    stocks: [MOCK_STOCKS[7], MOCK_STOCKS[1], MOCK_STOCKS[0], MOCK_STOCKS[3]],
    expiry: '1 Month',
    totalReturn: 12.4,
    backers: 850,
    isVerifiedKOL: true,
  },
  {
    id: 'p3',
    kolName: 'Value Victor',
    kolAvatar: 'https://picsum.photos/100/100?random=3',
    title: 'Safe Harbor Tech',
    description: 'Mega cap stocks that print cash.',
    stocks: [MOCK_STOCKS[2], MOCK_STOCKS[6], MOCK_STOCKS[4], MOCK_STOCKS[5]],
    expiry: '1 Year',
    totalReturn: 4.5,
    backers: 2100,
    isVerifiedKOL: true,
  }
];

export const MOCK_GAME_ROOMS: GameRoom[] = [
    {
        id: 'r1',
        name: 'WallStreetBetz Elite',
        description: 'High risk, high reward plays only. Verification required.',
        memberCount: 1250,
        portfolioCount: 45,
        isPrivate: true,
        avatar: 'https://picsum.photos/100/100?random=10'
    },
    {
        id: 'r2',
        name: 'Dividend Aristocrats',
        description: 'Slow and steady wins the race. 3% yield min.',
        memberCount: 340,
        portfolioCount: 12,
        isPrivate: false,
        avatar: 'https://picsum.photos/100/100?random=11'
    },
    {
        id: 'r3',
        name: 'Tech Titans 2024',
        description: 'Only companies with >$100B market cap.',
        memberCount: 890,
        portfolioCount: 28,
        isPrivate: false,
        avatar: 'https://picsum.photos/100/100?random=12'
    },
    {
        id: 'r4',
        name: 'Penny Stock Punks',
        description: 'Sub $5 stocks only. Not for the faint of heart.',
        memberCount: 2100,
        portfolioCount: 67,
        isPrivate: true,
        avatar: 'https://picsum.photos/100/100?random=13'
    }
];

// Helper to simulate live price ticks
export const getSimulatedPriceUpdate = (price: number): number => {
  const volatility = 0.002; // 0.2% movement max per tick
  const change = price * volatility * (Math.random() - 0.5);
  return Number((price + change).toFixed(2));
};

export const generateChartData = (points: number = 20, startPrice: number = 100): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let currentPrice = startPrice;
  for (let i = 0; i < points; i++) {
    currentPrice = getSimulatedPriceUpdate(currentPrice);
    data.push({
      time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      value: currentPrice
    });
  }
  return data;
};