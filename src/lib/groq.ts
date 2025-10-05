import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TransactionData {
  description: string;
  amount: number;
  date: string;
  category: string;
  merchant?: string;
  type: 'income' | 'expense';
  confidence: number;
}

export interface CategorizationResult {
  transactions: TransactionData[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    healthScore: number;
  };
}

interface RawTransaction {
  date: string;
  description: string;
  amount: number;
  type?: string;
}

export async function categorizeTransactionsWithAI(
  rawTransactions: RawTransaction[]
): Promise<CategorizationResult> {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    // Prepare transaction data for AI
    const transactionText = rawTransactions
      .map((tx, index) => `${index + 1}. ${JSON.stringify(tx)}`)
      .join('\n');

    const prompt = `
You are a financial AI assistant. Analyze the following transaction data and categorize each transaction properly.

For each transaction, provide:
- description: Clean, readable description
- amount: Numeric amount (positive for income, negative for expenses)
- date: Date in YYYY-MM-DD format
- category: One of these categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Groceries, Gas, Rent, Insurance, Salary, Investments, Other Income, Other Expense
- merchant: Store/company name if available
- type: "income" or "expense"
- confidence: Confidence score 0-100 (integer)

Transaction data:
${transactionText}

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just pure JSON):
{
  "transactions": [
    {
      "description": "string",
      "amount": number,
      "date": "YYYY-MM-DD",
      "category": "string",
      "merchant": "string or null",
      "type": "income or expense",
      "confidence": number
    }
  ],
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "savings": number,
    "healthScore": number
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations, no code blocks.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a financial AI assistant specialized in transaction categorization and analysis. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from Groq API");
    }

    // Clean the response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', response);
      console.error('Cleaned response:', cleanResponse);
      throw new Error("Failed to parse AI response as JSON");
    }
    
    // Validate the response structure
    if (!result.transactions || !Array.isArray(result.transactions)) {
      console.error('Invalid response structure:', result);
      throw new Error("Invalid response format from AI");
    }

    return result;

  } catch (error) {
    console.error("Error in AI categorization:", error);
    
    // Fallback to rule-based categorization
    return fallbackCategorization(rawTransactions);
  }
}

function fallbackCategorization(rawTransactions: RawTransaction[]): CategorizationResult {
  const transactions: TransactionData[] = rawTransactions.map((tx, index) => {
    // Basic rule-based categorization
    const description = tx.description || `Transaction ${index + 1}`;
    let amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : (tx.amount || 0);
    const date = tx.date || new Date().toISOString().split('T')[0];
    
    // Simple category detection based on keywords
    const category = detectCategory(description);
    
    // Determine type based on amount and category
    let type: 'income' | 'expense';
    if (amount < 0) {
      type = 'expense';
      amount = Math.abs(amount); // Make positive for storage
    } else if (amount > 0) {
      // Check if it's income based on category
      const incomeCategories = ['Salary', 'Investments', 'Other Income'];
      type = incomeCategories.includes(category) ? 'income' : 'expense';
    } else {
      type = 'expense'; // Default to expense for zero amounts
    }
    
    return {
      description,
      amount: Math.abs(amount),
      date,
      category,
      merchant: undefined,
      type,
      confidence: 70 // Default confidence for rule-based
    };
  });

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const savings = totalIncome - totalExpenses;
  const healthScore = calculateHealthScore(totalIncome, totalExpenses, savings);

  return {
    transactions,
    summary: {
      totalIncome,
      totalExpenses,
      savings,
      healthScore
    }
  };
}

function detectCategory(description: string): string {
  const desc = description.toLowerCase();
  
  const categories = {
    'Food & Dining': ['food', 'restaurant', 'grocery', 'dining', 'cafe', 'pizza', 'burger', 'coffee', 'lunch', 'dinner', 'swiggy', 'zomato', 'ubereats'],
    'Transportation': ['uber', 'taxi', 'gas', 'fuel', 'metro', 'bus', 'train', 'flight', 'parking', 'toll', 'ride', 'transport'],
    'Bills & Utilities': ['utilities', 'electricity', 'water', 'gas bill', 'internet', 'cable', 'phone', 'bill', 'utility'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'gym', 'fitness', 'game', 'concert', 'theater', 'entertainment'],
    'Shopping': ['amazon', 'store', 'shop', 'mall', 'clothing', 'shoes', 'electronics', 'book', 'purchase'],
    'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'dental', 'clinic', 'medicine', 'health'],
    'Education': ['school', 'university', 'course', 'book', 'tuition', 'education', 'learning', 'coursera', 'udemy'],
    'Travel': ['hotel', 'flight', 'vacation', 'trip', 'travel', 'booking'],
    'Groceries': ['grocery', 'supermarket', 'vegetables', 'fruits', 'milk', 'bread'],
    'Gas': ['gas', 'fuel', 'petrol', 'diesel', 'gas station'],
    'Rent': ['rent', 'rental', 'apartment', 'house'],
    'Insurance': ['insurance', 'premium', 'policy'],
    'Salary': ['salary', 'wage', 'payroll', 'income', 'bonus', 'commission'],
    'Investments': ['investment', 'stock', 'bond', 'mutual fund', 'savings', 'deposit']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }

  return 'Other Expense';
}

function calculateHealthScore(income: number, expenses: number, savings: number): number {
  if (income === 0) return 0;
  
  const savingsRate = (savings / income) * 100;
  const expenseRate = (expenses / income) * 100;
  
  let score = 50; // Base score
  
  // Savings rate scoring
  if (savingsRate >= 20) score += 30;
  else if (savingsRate >= 10) score += 20;
  else if (savingsRate >= 5) score += 10;
  else if (savingsRate < 0) score -= 20;
  
  // Expense rate scoring
  if (expenseRate <= 50) score += 20;
  else if (expenseRate <= 70) score += 10;
  else if (expenseRate > 90) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}
