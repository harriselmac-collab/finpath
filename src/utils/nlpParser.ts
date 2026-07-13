export interface ParsedTransaction {
  name: string;
  amount: number;
  type: 'income' | 'essential' | 'flexible';
  category: string;
}

const INCOME_KEYWORDS = ['salary', 'wage', 'freelance', 'bonus', 'dividend', 'interest', 'gift'];
const ESSENTIAL_KEYWORDS = [
  'rent', 'housing', 'mortgage', 'electric', 'water', 'electricity', 'utility', 'phone', 'internet', 
  'groceries', 'supermarket', 'food', 'market', 'meds', 'medication', 'doctor', 'health', 'pharmacy', 
  'school', 'childcare', 'fees', 'fuel', 'gas', 'petrol', 'maintenance', 'insurance', 'tax'
];
const FLEXIBLE_KEYWORDS = [
  'coffee', 'restaurant', 'cafe', 'movie', 'cinema', 'subscription', 'netflix', 'spotify', 'shopping', 
  'gift', 'gym', 'entertainment', 'travel', 'flight', 'taxi', 'hotel', 'dinner', 'lunch'
];

export const parseQuickEntry = (text: string): ParsedTransaction | null => {
  if (!text || !text.trim()) return null;

  // Extract the numeric amount (integer or decimal)
  const amountMatch = text.match(/\b\d+(?:\.\d{1,2})?\b/);
  if (!amountMatch) return null;

  const amount = Number(amountMatch[0]);
  
  // Clean text by removing the amount and extra spaces
  let cleanText = text.replace(amountMatch[0], '').replace(/\s+/g, ' ').trim();
  if (!cleanText) cleanText = 'Transaction';

  const lowerText = cleanText.toLowerCase();

  // Deduce type and category based on keywords
  let type: 'income' | 'essential' | 'flexible' = 'flexible';
  let category = 'Other';

  // 1. Check Income
  if (INCOME_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    type = 'income';
    category = 'Salary';
  }
  // 2. Check Essentials
  else if (ESSENTIAL_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    type = 'essential';
    if (lowerText.includes('rent') || lowerText.includes('housing') || lowerText.includes('mortgage')) {
      category = 'Housing';
    } else if (lowerText.includes('groceries') || lowerText.includes('supermarket') || lowerText.includes('food')) {
      category = 'Groceries';
    } else if (lowerText.includes('electric') || lowerText.includes('water') || lowerText.includes('internet') || lowerText.includes('phone') || lowerText.includes('utility')) {
      category = 'Utilities';
    } else if (lowerText.includes('meds') || lowerText.includes('medication') || lowerText.includes('doctor') || lowerText.includes('health') || lowerText.includes('pharmacy')) {
      category = 'Healthcare';
    } else if (lowerText.includes('fuel') || lowerText.includes('gas') || lowerText.includes('petrol') || lowerText.includes('maintenance')) {
      category = 'Vehicle';
    } else {
      category = 'Essentials';
    }
  }
  // 3. Check Flexible
  else if (FLEXIBLE_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    type = 'flexible';
    if (lowerText.includes('coffee') || lowerText.includes('cafe') || lowerText.includes('dinner') || lowerText.includes('lunch') || lowerText.includes('restaurant')) {
      category = 'Dining Out';
    } else if (lowerText.includes('movie') || lowerText.includes('cinema') || lowerText.includes('subscription') || lowerText.includes('netflix') || lowerText.includes('spotify')) {
      category = 'Entertainment';
    } else {
      category = 'Flexible';
    }
  }

  // Capitalize name
  const name = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

  return {
    name,
    amount,
    type,
    category,
  };
};
