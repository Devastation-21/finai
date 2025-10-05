import { NextRequest, NextResponse } from 'next/server';
import { generateMLPredictions, compareModels, MLPrediction } from '@/lib/ml-predictions';

interface Transaction {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface ModelComparison {
  model: string;
  mse: number;
  mae: number;
}

export async function POST(request: NextRequest) {
  try {
    const { transactions } = await request.json();
    
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 });
    }

    // Generate ML predictions
    const predictions = generateMLPredictions(transactions);
    
    // Prepare data for model comparison
    const monthlyData = prepareMonthlyData(transactions);
    const spendingValues = monthlyData.map(m => m.total);
    
    let modelComparison: ModelComparison[] = [];
    if (spendingValues.length >= 3) {
      modelComparison = compareModels(spendingValues);
    }

    // Calculate additional metrics
    const metrics = {
      totalTransactions: transactions.length,
      dataQuality: calculateDataQuality(transactions),
      predictionReliability: calculateReliability(predictions),
      recommendedModel: modelComparison.length > 0 ? modelComparison[0].model : 'Moving Average'
    };

    return NextResponse.json({
      success: true,
      predictions,
      modelComparison,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in ML predictions API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate ML predictions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function prepareMonthlyData(transactions: Transaction[]) {
  const monthlyData: { [key: string]: { total: number; count: number } } = {};
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 };
      }
      
      monthlyData[monthKey].total += transaction.amount;
      monthlyData[monthKey].count += 1;
    }
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, total: data.total, count: data.count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateDataQuality(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  
  let quality = 0;
  
  // Check data completeness
  const completeTransactions = transactions.filter(t => 
    t.amount && t.date && t.category && t.type
  );
  quality += (completeTransactions.length / transactions.length) * 40;
  
  // Check data recency
  const now = new Date();
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const daysDiff = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 90; // Last 3 months
  });
  quality += (recentTransactions.length / transactions.length) * 30;
  
  // Check data diversity
  const uniqueCategories = new Set(transactions.map(t => t.category));
  quality += Math.min(uniqueCategories.size * 5, 30);
  
  return Math.min(100, Math.round(quality));
}

function calculateReliability(predictions: MLPrediction[]): number {
  if (predictions.length === 0) return 0;
  
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  return Math.round(avgConfidence);
}

