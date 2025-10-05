import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getTransactions, getFinancialMetrics } from '@/lib/database';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set');
      // Return a fallback response instead of error
      return NextResponse.json({
        success: true,
        message: "I'm a financial AI assistant! I can help you with budgeting, saving tips, and financial advice. However, I'm currently running in demo mode. To enable full AI features, please set up your GROQ_API_KEY in the environment variables.",
        timestamp: new Date().toISOString()
      });
    }

    // Get user's financial data for context
    let financialContext = '';
    let userContext = '';
    
    if (userId && userId !== 'current-user') {
      try {
        const [transactions, metrics] = await Promise.all([
          getTransactions(userId, 15), // Last 15 transactions for better context
          getFinancialMetrics(userId)
        ]);

        // Add user identification
        userContext = `\n\n[USER CONTEXT - User ID: ${userId}]\nYou are speaking with a specific user. All advice should be personalized to their financial situation.`;

        if (transactions.length > 0) {
          // Categorize transactions for better insights
          const incomeTransactions = transactions.filter(tx => tx.type === 'income');
          const expenseTransactions = transactions.filter(tx => tx.type === 'expense');
          
          // Get spending by category
          const categorySpending = expenseTransactions.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
            return acc;
          }, {} as Record<string, number>);

          financialContext = `\n\n[USER'S FINANCIAL DATA]\n`;
          
          // Recent transactions
          financialContext += `\nRecent Transactions (Last ${transactions.length}):\n${transactions.map(tx => 
            `- ${tx.description}: ₹${Math.abs(tx.amount).toLocaleString('en-IN')} (${tx.category}) on ${tx.date}`
          ).join('\n')}`;

          // Spending patterns
          if (Object.keys(categorySpending).length > 0) {
            financialContext += `\n\nSpending by Category:\n${Object.entries(categorySpending)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([category, amount]) => `- ${category}: ₹${(amount as number).toLocaleString('en-IN')}`)
              .join('\n')}`;
          }

          // Transaction insights
          const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          const avgTransactionAmount = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / transactions.length;
          
          financialContext += `\n\nTransaction Insights:\n- Total Income: ₹${totalIncome.toLocaleString('en-IN')}\n- Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}\n- Average Transaction: ₹${avgTransactionAmount.toLocaleString('en-IN')}`;
        }

        if (metrics) {
          console.log('Metrics object:', JSON.stringify(metrics, null, 2));
          
          const totalIncome = metrics.total_income || 0;
          const totalExpenses = metrics.total_expenses || 0;
          const savings = metrics.savings || 0;
          const healthScore = metrics.health_score || 0;
          const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
          
          financialContext += `\n\nFinancial Health Summary:\n- Total Income: ₹${totalIncome.toLocaleString('en-IN')}\n- Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}\n- Savings: ₹${savings.toLocaleString('en-IN')}\n- Savings Rate: ${savingsRate.toFixed(1)}%\n- Health Score: ${healthScore}/100`;
        }
      } catch (error) {
        console.error('Error fetching financial data for chat context:', error);
        // Continue without context
      }
    }

    const systemPrompt = `You are FinAI, an AI financial advisor assistant. You help users with personal finance questions, budgeting advice, and financial insights.

Key guidelines:
- Be professional, helpful, and encouraging
- Provide practical, actionable advice
- Use the user's financial data when available to give personalized insights
- Keep responses concise but informative
- If you don't have specific data, provide general financial advice
- Always prioritize financial health and responsible spending
- Remember you are speaking to ONE specific user - all advice should be personalized to their situation
- Reference their specific spending patterns, categories, and financial metrics when relevant

${userContext}${financialContext}`;

    // Debug: Log the context being sent (remove in production)
    console.log('AI Chat Context for user:', userId);
    console.log('Financial context length:', financialContext.length);
    console.log('User context:', userContext);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback response
    const fallbackResponses = [
      "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      "I'm experiencing some technical difficulties. Could you please rephrase your question?",
      "I'm temporarily unavailable. Please try again later or contact support if the issue persists."
    ];
    
    const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      success: false,
      message: fallbackMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
