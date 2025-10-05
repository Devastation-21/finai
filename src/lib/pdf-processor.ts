import * as XLSX from 'xlsx';

export interface ProcessedDocument {
  text: string;
  transactions: any[];
  metadata: {
    filename: string;
    fileType: string;
    pageCount?: number;
    extractedAt: string;
  };
}

export async function processPDF(file: File): Promise<ProcessedDocument> {
  try {
    // For now, we'll focus on CSV and Excel files
    // PDF processing can be added later with a different approach
    throw new Error('PDF processing is temporarily disabled. Please use CSV or Excel files for now.');
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('PDF processing is not available. Please use CSV or Excel files instead.');
  }
}

export async function processExcel(file: File): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Extract transactions from the data
    const transactions = extractTransactionsFromExcel(jsonData);
    
    return {
      text: `Excel file with ${jsonData.length} rows`,
      transactions,
      metadata: {
        filename: file.name,
        fileType: file.type,
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error processing Excel:', error);
    throw new Error('Failed to process Excel file');
  }
}

export async function processCSV(file: File): Promise<ProcessedDocument> {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const transactions = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const transaction: any = {};
        headers.forEach((header, index) => {
          transaction[header] = values[index] || '';
        });
        
        // Convert amount to proper format (negative for expenses, positive for income)
        if (transaction.Amount) {
          const amount = parseFloat(transaction.Amount);
          // If it's an expense (based on category or description), make it negative
          const isExpense = transaction.Category && 
            !['Salary', 'Investments', 'Other Income'].includes(transaction.Category);
          
          if (isExpense && amount > 0) {
            transaction.Amount = -amount;
          }
        }
        
        return transaction;
      });
    
    return {
      text: `CSV file with ${transactions.length} transactions`,
      transactions,
      metadata: {
        filename: file.name,
        fileType: file.type,
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw new Error('Failed to process CSV file');
  }
}

function extractTransactionsFromText(text: string): any[] {
  const transactions: any[] = [];
  
  // Common patterns for bank statements
  const patterns = [
    // Pattern 1: Date, Description, Amount
    /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+?)\s+([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    // Pattern 2: Date, Description, Debit, Credit
    /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+?)\s+(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)?\s+(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)?/g,
    // Pattern 3: Description, Date, Amount
    /(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const transaction: any = {};
      
      if (pattern === patterns[0]) {
        // Date, Description, Amount
        transaction.date = match[1];
        transaction.description = match[2].trim();
        transaction.amount = parseFloat(match[3].replace(/[$,]/g, ''));
      } else if (pattern === patterns[1]) {
        // Date, Description, Debit, Credit
        transaction.date = match[1];
        transaction.description = match[2].trim();
        const debit = match[3] ? parseFloat(match[3].replace(/[$,]/g, '')) : 0;
        const credit = match[4] ? parseFloat(match[4].replace(/[$,]/g, '')) : 0;
        transaction.amount = credit > 0 ? credit : -debit;
      } else if (pattern === patterns[2]) {
        // Description, Date, Amount
        transaction.description = match[1].trim();
        transaction.date = match[2];
        transaction.amount = parseFloat(match[3].replace(/[$,]/g, ''));
      }
      
      if (transaction.date && transaction.description && transaction.amount !== undefined) {
        transactions.push(transaction);
      }
    }
  });
  
  return transactions;
}

function extractTransactionsFromExcel(data: any[]): any[] {
  return data.map((row, index) => {
    // Common column mappings
    const transaction: any = {};
    
    // Try to find common column names
    const dateColumn = findColumn(row, ['date', 'Date', 'DATE', 'transaction_date', 'Transaction Date']);
    const descriptionColumn = findColumn(row, ['description', 'Description', 'DESCRIPTION', 'memo', 'Memo', 'details', 'Details']);
    const amountColumn = findColumn(row, ['amount', 'Amount', 'AMOUNT', 'transaction_amount', 'Transaction Amount']);
    const debitColumn = findColumn(row, ['debit', 'Debit', 'DEBIT', 'withdrawal', 'Withdrawal']);
    const creditColumn = findColumn(row, ['credit', 'Credit', 'CREDIT', 'deposit', 'Deposit']);
    
    transaction.date = row[dateColumn] || '';
    transaction.description = row[descriptionColumn] || `Transaction ${index + 1}`;
    
    if (amountColumn) {
      transaction.amount = parseFloat(String(row[amountColumn]).replace(/[$,]/g, '')) || 0;
    } else if (debitColumn && creditColumn) {
      const debit = parseFloat(String(row[debitColumn]).replace(/[$,]/g, '')) || 0;
      const credit = parseFloat(String(row[creditColumn]).replace(/[$,]/g, '')) || 0;
      transaction.amount = credit > 0 ? credit : -debit;
    } else {
      transaction.amount = 0;
    }
    
    return transaction;
  }).filter(tx => tx.date && tx.description);
}

function findColumn(row: any, possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    if (row.hasOwnProperty(name)) {
      return name;
    }
  }
  return null;
}

export function getFileProcessor(fileType: string) {
  switch (fileType) {
    case 'application/pdf':
      throw new Error('PDF processing is temporarily disabled. Please use CSV or Excel files.');
    case 'text/csv':
      return processCSV;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return processExcel;
    default:
      throw new Error(`Unsupported file type: ${fileType}. Please use CSV or Excel files.`);
  }
}
