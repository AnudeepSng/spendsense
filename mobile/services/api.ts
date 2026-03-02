import axios from 'axios';

// ⚠️ Replace YOUR_MAC_IP with your actual IP (run: ipconfig getifaddr en0)
export const API_URL = 'http://192.168.29.108:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export interface Transaction {
  parse_error: string;
  id: string;
  raw_sms: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  merchant_normalized: string;
  category: string;
  bank: string;
  account_last4: string;
  balance: number;
  channel: string;
  upi_ref: string;
  parsed: boolean;
  received_at: string;
  created_at: string;
}

export interface Summary {
  total_spent: number;
  total_income: number;
  net_savings: number;
  total_transactions: number;
  category_breakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export const parseSMS = async (sms: string) => {
  const res = await api.post('/parse-sms', {
    sms,
    received_at: new Date().toISOString(),
  });
  return res.data as Transaction;
};

export const getTransactions = async (filters?: {
  category?: string;
  type?: string;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.limit) params.append('limit', String(filters.limit));
  const res = await api.get(`/transactions?${params.toString()}`);
  return res.data as { count: number; transactions: Transaction[] };
};

export const getSummary = async () => {
  const res = await api.get('/summary');
  return res.data as Summary;
};

export const getAnomalies = async () => {
  const res = await api.get('/anomalies');
  return res.data;
};

export const clearTransactions = async () => {
  const res = await api.delete('/transactions/clear');
  return res.data;
};

export const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔', Groceries: '🛒', Travel: '🚂',
  Entertainment: '🎬', Health: '💊', Bills: '⚡',
  Shopping: '🛍️', Education: '📚', Investment: '📈',
  Transfer: '💸', Cash: '💵', Other: '💳',
};

export const getCategoryIcon = (category: string) =>
  CATEGORY_ICONS[category] || '💳';

export const SAMPLE_SMS = [
  "Rs.1,250.00 debited from A/c XX4521 on 14-Feb-25 at SWIGGY UPI. Avl Bal: Rs.8,432.10 -SBI",
  "Rs 499 debited from HDFC Bank a/c **4521 on 14-02-25 at NETFLIX. Avl bal: Rs 12,300",
  "ICICI Bank Acct XX4521 debited for Rs 1,800.00 on 14-Feb-25; IRCTC credited.",
  "Sent Rs.650 to zepto@okicici via UPI. Ref: 405234123456",
  "Money received! Rs.2,100 from Rahul Sharma via UPI Ref: 405234999888",
  "INR 340 spent at APOLLO PHARMACY via UPI on 14-Feb-25",
];