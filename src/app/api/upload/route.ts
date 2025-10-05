import { NextRequest, NextResponse } from 'next/server';
import { getFileProcessor } from '@/lib/pdf-processor';
import { categorizeTransactionsWithAI } from '@/lib/groq';
import { createTransaction, createUploadedFile, updateFileStatus, getUserById } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the user to find their Clerk user ID
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clerkUserId = user.clerk_user_id;

    // Create file record in database
    const fileRecord = await createUploadedFile({
      user_id: userId,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: '', // Will be updated after processing
      status: 'processing'
    });

    try {
      // Process the file based on its type
      const processor = getFileProcessor(file.type);
      const processedDoc = await processor(file);

      console.log(`Processed ${processedDoc.transactions.length} transactions from ${file.name}`);

      // Check if transactions already have proper categorization (from PDF with structured data)
      const hasStructuredData = processedDoc.transactions.some(tx => 
        tx.type && (tx.type === 'income' || tx.type === 'expense') && tx.category
      );

      let categorizationResult;
      if (hasStructuredData && file.type === 'application/pdf') {
        // For PDF files with structured data (including AI-extracted), use the parsed data directly
        console.log('Using structured PDF data without additional AI categorization');
        categorizationResult = {
          transactions: processedDoc.transactions,
          summary: {
            totalIncome: processedDoc.transactions
              .filter(tx => tx.type === 'income')
              .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
            totalExpenses: processedDoc.transactions
              .filter(tx => tx.type === 'expense')
              .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
            savings: 0,
            healthScore: 75
          }
        };
      } else {
        // Use AI to categorize transactions for CSV/Excel or unstructured PDF
        categorizationResult = await categorizeTransactionsWithAI(processedDoc.transactions);
      }

      // Save transactions to database
      const savedTransactions = [];
      for (const transaction of categorizationResult.transactions) {
        try {
          // Ensure amount is properly formatted as decimal and convert to string for PostgreSQL
          const formattedAmount = parseFloat(transaction.amount.toFixed(2));
          
          console.log('💾 Saving transaction:', {
            description: transaction.description,
            originalAmount: transaction.amount,
            formattedAmount: formattedAmount,
            type: typeof formattedAmount,
            category: transaction.category
          });
          
          const savedTransaction = await createTransaction(clerkUserId, {
            description: transaction.description,
            amount: formattedAmount,
            date: transaction.date,
            category: transaction.category || 'Other',
            merchant: null,
            type: transaction.type,
            confidence: 85  // Default confidence score
          });
          savedTransactions.push(savedTransaction);
        } catch (error) {
          console.error('Error saving transaction:', error);
          console.error('Transaction data:', transaction);
          // Continue with other transactions
        }
      }

      // Update file status to completed
      await updateFileStatus(fileRecord.id, 'completed');

      // Check budget alerts after processing transactions
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        await fetch(`${baseUrl}/api/check-budget-alerts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      } catch (alertError) {
        console.error('Error checking budget alerts after file upload:', alertError);
        // Don't fail the upload if alert checking fails
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${savedTransactions.length} transactions`,
        data: {
          fileId: fileRecord.id,
          transactionsCount: savedTransactions.length,
          summary: categorizationResult.summary,
          transactions: savedTransactions
        }
      });

    } catch (error) {
      console.error('Error processing file:', error);
      
      // Update file status to failed
      await updateFileStatus(fileRecord.id, 'failed');
      
      return NextResponse.json({
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
