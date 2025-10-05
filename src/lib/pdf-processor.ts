import * as XLSX from 'xlsx';
import pdf2json from 'pdf2json';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

interface PdfData {
  Pages?: Array<unknown>;
}

export interface ProcessedDocument {
  text: string;
  transactions: Transaction[];
  metadata: {
    filename: string;
    fileType: string;
    pageCount?: number;
    extractedAt: string;
  };
}

export async function processPDF(file: File): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new Promise((resolve, reject) => {
      const pdfParser = new pdf2json();
      
      pdfParser.on('pdfParser_dataError', (errData: unknown) => {
        console.error('PDF parsing error:', errData);
        reject(new Error('Failed to parse PDF file'));
      });
      
      pdfParser.on('pdfParser_dataReady', async (pdfData: unknown) => {
        try {
          // Extract text from all pages
          let fullText = '';
          if ((pdfData as { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> }).Pages) {
            (pdfData as { Pages: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> }).Pages.forEach((page) => {
              if (page.Texts) {
                page.Texts.forEach((text) => {
                  if (text.R) {
                    text.R.forEach((run) => {
                      if (run.T) {
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    });
                  }
                });
              }
            });
          }
          
          // Extract transactions from the text
          const transactions = await extractTransactionsFromText(fullText);
          
          resolve({
            text: fullText,
            transactions,
            metadata: {
              filename: file.name,
              fileType: file.type,
              pageCount: (pdfData as PdfData).Pages ? (pdfData as PdfData).Pages!.length : 0,
              extractedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          console.error('Error processing PDF data:', error);
          reject(new Error('Failed to process PDF content'));
        }
      });
      
      // Parse the PDF
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file. Please ensure the file is a valid PDF.');
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
    const transactions = extractTransactionsFromExcel(jsonData as Record<string, unknown>[]);
    
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
        const transaction: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          transaction[header] = values[index] || '';
        });
        
        // Convert amount to proper format (negative for expenses, positive for income)
        if (transaction.Amount) {
          const amount = parseFloat(transaction.Amount as string);
          // If it's an expense (based on category or description), make it negative
          const isExpense = transaction.Category && 
            !['Salary', 'Investments', 'Other Income'].includes(transaction.Category as string);
          
          if (isExpense && amount > 0) {
            transaction.Amount = -amount;
          }
        }
        
        return {
          date: transaction.Date as string || new Date().toISOString().split('T')[0],
          description: transaction.Description as string || 'Transaction',
          amount: parseFloat(transaction.Amount as string) || 0,
          type: (transaction.Type as string) === 'income' ? 'income' as const : 'expense' as const,
          category: transaction.Category as string || 'Other'
        };
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

async function extractTransactionsFromText(text: string): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  
  // Clean up the text first
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Split by lines and process each line
  const lines = cleanText.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for the header row to understand the format
  let headerIndex = -1;
  let hasHeader = false;
  let isBankStatement = false;
  
  // Check if this is a bank statement by looking for the header pattern in the text
  if (cleanText.toLowerCase().includes('date') && 
      cleanText.toLowerCase().includes('narration') && 
      (cleanText.toLowerCase().includes('withdrawal') || cleanText.toLowerCase().includes('deposit'))) {
    hasHeader = true;
    isBankStatement = true;
  } else {
    // Check regular format
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('date') && line.includes('description') && line.includes('amount')) {
        headerIndex = i;
        hasHeader = true;
        break;
      }
    }
  }
  
  if (hasHeader) {
    if (isBankStatement) {
      // Use AI to extract transactions from bank statement text
      console.log('Using AI to extract transactions from bank statement...');
      
      try {
        const aiTransactions = await extractTransactionsWithAI(cleanText);
        transactions.push(...aiTransactions);
        console.log(`AI extracted ${aiTransactions.length} transactions from bank statement`);
      } catch (error) {
        console.error('AI extraction failed, falling back to regex parsing:', error);
        
        // Fallback to simple regex parsing
        const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
        const dates = [];
        let dateMatch;
        
        while ((dateMatch = datePattern.exec(cleanText)) !== null) {
          dates.push({
            date: dateMatch[1],
            index: dateMatch.index
          });
        }
        
        console.log(`Found ${dates.length} date patterns in bank statement`);
        
        // For each date, try to extract the transaction
        for (let i = 0; i < dates.length; i++) {
          const currentDate = dates[i];
          const nextDate = dates[i + 1];
          
          // Extract text between current date and next date (or end of text)
          const startIndex = currentDate.index;
          const endIndex = nextDate ? nextDate.index : cleanText.length;
          const transactionText = cleanText.substring(startIndex, endIndex).trim();
          
          // Skip if this looks like a header
          if (transactionText.toLowerCase().includes('date') || 
              transactionText.toLowerCase().includes('narration') ||
              transactionText.toLowerCase().includes('withdrawal') ||
              transactionText.toLowerCase().includes('deposit') ||
              transactionText.toLowerCase().includes('balance')) {
            continue;
          }
          
          // Extract numbers from the transaction text
          const numbers = [];
          const numberPattern = /(\d+(?:\.\d{2})?)/g;
          let numberMatch;
          
          while ((numberMatch = numberPattern.exec(transactionText)) !== null) {
            numbers.push(parseFloat(numberMatch[1]));
          }
          
          // Extract description (everything between date and first number)
          const firstNumberIndex = transactionText.search(/\d+(?:\.\d{2})?/);
          const description = firstNumberIndex > 0 ? 
            transactionText.substring(currentDate.date.length, firstNumberIndex).trim() : 
            transactionText.substring(currentDate.date.length).trim();
          
          // For bank statements, typically:
          // - First number is withdrawal (if present)
          // - Second number is deposit (if present) 
          // - Last number is balance (ignore this)
          
          if (numbers.length >= 2) {
            // Process withdrawal (first number, if > 0)
            if (numbers[0] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: -numbers[0], // Negative for withdrawals
                type: 'expense'
              });
            }
            
            // Process deposit (second number, if > 0)
            if (numbers.length >= 2 && numbers[1] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: numbers[1], // Positive for deposits
                type: 'income'
              });
            }
          }
        }
      }
    } else if (headerIndex >= 0) {
      // Process regular structured data with header
      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.length < 10) continue;
        
        // Skip lines that don't start with a date
        const dateMatch = line.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (!dateMatch) continue;
        
        // Handle regular format: Date Description Amount Category Type
        const parts = line.split(/\s{2,}|\s+/);
        
        if (parts.length >= 4) {
          const transaction: Partial<Transaction> = {};
          transaction.date = dateMatch[1];
          
          // Find amount (look for number with decimal)
          let amountIndex = -1;
          let amount = 0;
          for (let j = 1; j < parts.length; j++) {
            const numMatch = parts[j].match(/(\d+(?:\.\d{2})?)/);
            if (numMatch) {
              amount = parseFloat(numMatch[1]);
              amountIndex = j;
              break;
            }
          }
          
          if (amountIndex > 0 && amount > 0) {
            // Description is everything between date and amount
            transaction.description = parts.slice(1, amountIndex).join(' ').trim();
            transaction.amount = amount;
            
            // Check if there's a type indicator (Income/Expense)
            const typeIndicator = parts[parts.length - 1].toLowerCase();
            if (typeIndicator === 'income') {
              transaction.type = 'income';
            } else if (typeIndicator === 'expense') {
              transaction.type = 'expense';
              transaction.amount = -transaction.amount; // Make expenses negative
            } else {
              // Default to expense if no type specified
              transaction.type = 'expense';
              transaction.amount = -transaction.amount;
            }
            
            // Add category if present
            if (parts.length > amountIndex + 1) {
              transaction.category = parts[amountIndex + 1];
            }
            
            // Validate transaction
            if (transaction.date && transaction.description && transaction.amount !== 0) {
              transactions.push(transaction as Transaction);
            }
          }
        }
      }
    }
  } else {
    // Fallback to regex patterns for unstructured data
  const patterns = [
      // Pattern 1: Date, Description, Amount (with various date formats)
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    // Pattern 2: Date, Description, Debit, Credit
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)?\s+(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)?/g,
    // Pattern 3: Description, Date, Amount
      /(.+?)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
      // Pattern 4: Amount at start, Date, Description
      /([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)(?=\s+[+-]?\$?\d|\s*$)/g,
      // Pattern 5: Credit card statement format
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([+-]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
    ];
    
    patterns.forEach((pattern, patternIndex) => {
    let match;
      while ((match = pattern.exec(cleanText)) !== null) {
      const transaction: Partial<Transaction> = {};
      
        try {
          if (patternIndex === 0) {
        // Date, Description, Amount
        transaction.date = match[1];
        transaction.description = match[2].trim();
        transaction.amount = parseFloat(match[3].replace(/[$,]/g, ''));
          } else if (patternIndex === 1) {
        // Date, Description, Debit, Credit
        transaction.date = match[1];
        transaction.description = match[2].trim();
        const debit = match[3] ? parseFloat(match[3].replace(/[$,]/g, '')) : 0;
        const credit = match[4] ? parseFloat(match[4].replace(/[$,]/g, '')) : 0;
        transaction.amount = credit > 0 ? credit : -debit;
          } else if (patternIndex === 2) {
        // Description, Date, Amount
        transaction.description = match[1].trim();
        transaction.date = match[2];
        transaction.amount = parseFloat(match[3].replace(/[$,]/g, ''));
          } else if (patternIndex === 3) {
            // Amount, Date, Description
            transaction.amount = parseFloat(match[1].replace(/[$,]/g, ''));
            transaction.date = match[2];
            transaction.description = match[3].trim();
          } else if (patternIndex === 4) {
            // Credit card format: Date, Date, Description, Amount
            transaction.date = match[1];
            transaction.description = match[3].trim();
            transaction.amount = parseFloat(match[4].replace(/[$,]/g, ''));
          }
          
          // Validate and clean the transaction
          if (transaction.date && transaction.description && transaction.amount !== undefined && !isNaN(transaction.amount)) {
            // Clean up description
            transaction.description = transaction.description.replace(/\s+/g, ' ').trim();
            
            // Skip if description is too short or looks like a header
            if (transaction.description.length < 3 || 
                transaction.description.toLowerCase().includes('date') ||
                transaction.description.toLowerCase().includes('description') ||
                transaction.description.toLowerCase().includes('amount')) {
              continue;
            }
            
            // Skip if amount is 0
            if (transaction.amount === 0) {
              continue;
            }
            
            // Add transaction type based on amount
            transaction.type = transaction.amount > 0 ? 'income' : 'expense';
            
        transactions.push(transaction as Transaction);
          }
        } catch (error) {
          console.warn('Error parsing transaction:', error, match);
          continue;
        }
      }
    });
  }
  
  // Remove duplicates based on date, description, and amount
  const uniqueTransactions = transactions.filter((transaction, index, self) => 
    index === self.findIndex(t => 
      t.date === transaction.date && 
      t.description === transaction.description && 
      t.amount === transaction.amount
    )
  );
  
  return uniqueTransactions;
}

// Convert PDF text to table format for better AI understanding
function convertTextToTable(text: string): string {
  console.log('📊 Converting bank statement to table format...');
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Find the header row (contains DATE, NARRATION, etc.)
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('DATE') && lines[i].includes('NARRATION')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.log('⚠️ Could not find table header, using original text');
    return text;
  }
  
  console.log('📋 Found header at line:', headerIndex);
  console.log('📋 Header:', lines[headerIndex]);
  
  // Extract header
  const header = lines[headerIndex];
  
  // Find data rows (after header)
  const dataRows = lines.slice(headerIndex + 1);
  
  // Convert to table format
  let tableText = `BANK STATEMENT TABLE:\n\n`;
  tableText += `| ${header} |\n`;
  tableText += `|${'---|'.repeat(header.split(/\s+/).length)}\n`;
  
  // Process each data row
  dataRows.forEach((row) => {
    if (row.trim() && !row.includes('Page') && !row.includes('Statement')) {
      // Clean up the row
      const cleanRow = row.replace(/\s+/g, ' ').trim();
      if (cleanRow.length > 10) { // Filter out very short rows
        tableText += `| ${cleanRow} |\n`;
      }
    }
  });
  
  console.log('📊 Generated table format:');
  console.log(tableText.substring(0, 500) + '...');
  
  return tableText;
}

async function extractTransactionsWithAI(text: string): Promise<Transaction[]> {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }


        // Convert to table format first
        const tableText = convertTextToTable(text);
        
        const prompt = `
You are a financial AI assistant specialized in extracting transactions from bank statement tables.

The bank statement has been converted to a table format with columns: DATE | NARRATION | CHQ.NO. | WITHDRAWAL (DR) | DEPOSIT (CR) | BALANCE

CRITICAL TABLE ANALYSIS RULES:
1. Each row represents one transaction
2. Look at the WITHDRAWAL (DR) and DEPOSIT (CR) columns
3. If WITHDRAWAL (DR) has an amount: type="expense", amount=negative
4. If DEPOSIT (CR) has an amount: type="income", amount=positive
5. IGNORE the BALANCE column - it's not a transaction
6. Opening Balance is always a deposit (income, positive amount)

EXAMPLE TABLE ANALYSIS:
| DATE | NARRATION | CHQ.NO. | WITHDRAWAL (DR) | DEPOSIT (CR) | BALANCE |
| 01-03-2024 | Opening Balance | | | 485.11 | 485.11 |
| 01-03-2024 | UPI/PAYMENT | | 144.00 | | 341.11 |

From this table:
- Row 1: DEPOSIT column has 485.11 → type="income", amount=485.11
- Row 2: WITHDRAWAL column has 144.00 → type="expense", amount=-144.00

For each transaction, provide:
- date: Date in YYYY-MM-DD format
- description: Clean, readable description of the transaction
- amount: Numeric amount (positive for deposits/credits, negative for withdrawals/debits)
- type: "income" for deposits/credits, "expense" for withdrawals/debits
- category: One of these categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Groceries, Gas, Rent, Insurance, Salary, Investments, Other Income, Other Expense

Bank Statement Table:
${tableText}

Return the transactions as a JSON array. Each transaction should have: date, description, amount, type, category.
`;

        // Try multiple free AI services
        let response;
        // let error; // Removed unused variable
        
        // 1. Try Hugging Face (100% Free)
        if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'hf_your_token_here') {
          try {
            console.log('🤖 Using Hugging Face (Free) for AI-powered PDF transaction extraction...');
            response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: `Extract financial transactions from this bank statement and return as JSON array with date, description, amount, type, category:\n\n${prompt}`,
                parameters: {
                  max_length: 2000,
                  temperature: 0.1,
                  return_full_text: false,
                  do_sample: true
                }
              })
            });
            
            if (response.ok) {
              console.log('✅ Hugging Face successfully extracted transactions');
            } else {
              throw new Error(`Hugging Face API error: ${response.status}`);
            }
          } catch (err) {
            console.log('❌ Hugging Face failed, trying OpenAI...');
            // Store error for fallback
            console.error('Hugging Face error:', err);
          }
        }
        
        // 2. Try OpenAI (if API key is available)
        if ((!response || !response.ok) && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
          try {
            console.log('🤖 Using OpenAI for AI-powered PDF transaction extraction...');
            response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a financial AI assistant that extracts transactions from bank statements. Always return valid JSON arrays.'
                  },
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                temperature: 0.1,
                max_tokens: 4000
              })
            });
            
            if (response.ok) {
              console.log('✅ OpenAI successfully extracted transactions');
            } else {
              throw new Error(`OpenAI API error: ${response.status}`);
            }
          } catch (err) {
            console.log('❌ OpenAI failed, trying Groq...');
            // Store error for fallback
            console.error('OpenAI error:', err);
          }
        }
        
        // 3. Try Groq (Free tier)
        if ((!response || !response.ok) && process.env.GROQ_API_KEY) {
          try {
            console.log('🤖 Using Groq (Free tier) for AI-powered PDF transaction extraction...');
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a financial AI assistant that extracts transactions from bank statements. Always return valid JSON arrays.'
                  },
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                temperature: 0.1,
                max_tokens: 4000
              })
            });
            
            if (response.ok) {
              console.log('✅ Groq successfully extracted transactions');
            } else {
              throw new Error(`Groq API error: ${response.status}`);
            }
          } catch (err) {
            console.log('❌ All AI services failed, falling back to regex parsing...');
            // Store error for fallback
            console.error('Groq error:', err);
          }
        }

    if (!response || !response.ok) {
      console.log('🔄 All AI services failed, using enhanced regex parsing...');
      
      // Enhanced regex fallback for bank statements
      const transactions: Transaction[] = [];
      
      // Look for date patterns and extract transactions
      const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
      const dates = [];
      let dateMatch;
      
      while ((dateMatch = datePattern.exec(text)) !== null) {
        dates.push({
          date: dateMatch[1],
          index: dateMatch.index
        });
      }
      
      console.log(`Found ${dates.length} date patterns in bank statement`);
      
      // For each date, try to extract the transaction
      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i];
        const nextDate = dates[i + 1];
        
        // Extract text between current date and next date (or end of text)
        const startIndex = currentDate.index;
        const endIndex = nextDate ? nextDate.index : text.length;
        const transactionText = text.substring(startIndex, endIndex).trim();
        
        // Skip if this looks like a header
        if (transactionText.toLowerCase().includes('date') || 
            transactionText.toLowerCase().includes('narration') ||
            transactionText.toLowerCase().includes('withdrawal') ||
            transactionText.toLowerCase().includes('deposit') ||
            transactionText.toLowerCase().includes('balance')) {
          continue;
        }
        
        // Extract numbers from the transaction text
        const numbers = [];
        const numberPattern = /(\d+(?:\.\d{2})?)/g;
        let numberMatch;
        
        while ((numberMatch = numberPattern.exec(transactionText)) !== null) {
          numbers.push(parseFloat(numberMatch[1]));
        }
        
        // Extract description (everything between date and first number)
        const firstNumberIndex = transactionText.search(/\d+(?:\.\d{2})?/);
        const description = firstNumberIndex > 0 ? 
          transactionText.substring(currentDate.date.length, firstNumberIndex).trim() : 
          transactionText.substring(currentDate.date.length).trim();
        
        // For bank statements, analyze the transaction text to determine type
        // Look for keywords that indicate withdrawal vs deposit
        const isWithdrawal = transactionText.toLowerCase().includes('withdrawal') || 
                            transactionText.toLowerCase().includes('debit') ||
                            transactionText.toLowerCase().includes('upi') ||
                            transactionText.toLowerCase().includes('transfer') ||
                            transactionText.toLowerCase().includes('payment') ||
                            transactionText.toLowerCase().includes('atm') ||
                            transactionText.toLowerCase().includes('pos') ||
                            transactionText.toLowerCase().includes('card');
        
        const isDeposit = transactionText.toLowerCase().includes('deposit') || 
                         transactionText.toLowerCase().includes('credit') ||
                         transactionText.toLowerCase().includes('salary') ||
                         transactionText.toLowerCase().includes('opening balance') ||
                         transactionText.toLowerCase().includes('refund') ||
                         transactionText.toLowerCase().includes('interest');
        
        // Check if this looks like a bank statement with WITHDRAWAL/DEPOSIT columns
        const hasWithdrawalColumn = text.toLowerCase().includes('withdrawal') && 
                                  text.toLowerCase().includes('deposit') &&
                                  text.toLowerCase().includes('balance');
        
        // If it's a proper bank statement, use column-based logic
        if (hasWithdrawalColumn) {
          // For bank statements with WITHDRAWAL/DEPOSIT columns
          // First number is usually withdrawal, second is deposit
          if (numbers.length >= 2) {
            if (numbers[0] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: -numbers[0], // First number is withdrawal (expense)
                type: 'expense',
                category: 'Other Expense'
              });
            }
            if (numbers[1] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: numbers[1], // Second number is deposit (income)
                type: 'income',
                category: 'Other Income'
              });
            }
          }
          continue; // Skip the keyword-based logic for proper bank statements
        }
        
        // Process transactions based on type
        if (numbers.length >= 1) {
          if (isWithdrawal && numbers[0] > 0) {
            // This is a withdrawal (expense)
            transactions.push({
              date: currentDate.date,
              description: description,
              amount: -numbers[0], // Negative for withdrawals
              type: 'expense',
              category: 'Other Expense'
            });
          } else if (isDeposit && numbers[0] > 0) {
            // This is a deposit (income)
            transactions.push({
              date: currentDate.date,
              description: description,
              amount: numbers[0], // Positive for deposits
              type: 'income',
              category: 'Other Income'
            });
          } else if (numbers.length >= 2) {
            // If we have both withdrawal and deposit columns
            if (numbers[0] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: -numbers[0], // First number is usually withdrawal
                type: 'expense',
                category: 'Other Expense'
              });
            }
            if (numbers[1] > 0) {
              transactions.push({
                date: currentDate.date,
                description: description,
                amount: numbers[1], // Second number is usually deposit
                type: 'income',
                category: 'Other Income'
              });
            }
          }
        }
      }
      
      console.log(`Enhanced regex extracted ${transactions.length} transactions`);
  return transactions;
}

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ AI successfully extracted transactions');
    
    // Clean the content - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Extract only the JSON array part (everything between first [ and last ])
    const firstBracket = cleanContent.indexOf('[');
    const lastBracket = cleanContent.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleanContent = cleanContent.substring(firstBracket, lastBracket + 1);
    }
    
    console.log('Cleaned AI response:', cleanContent.substring(0, 200) + '...');
    
    // Parse the JSON response
    let transactions;
    try {
      transactions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.log('❌ Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', content);
      throw new Error('AI returned invalid JSON format');
    }
    
    // Validate and clean the transactions
    const validTransactions = transactions.filter((tx: Transaction) => 
      tx.date && 
      tx.description && 
      tx.amount !== undefined && 
      tx.type && 
      tx.category
    );
    
    console.log(`✅ Successfully parsed ${validTransactions.length} valid transactions from AI`);
    
    // Manual override for common bank statement patterns - be very conservative
    console.log('🔧 Applying manual categorization rules...');
    const manuallyCategorizedTransactions = validTransactions.map((transaction: Transaction) => {
      // Only override opening balance - everything else let AI decide based on columns
      if (transaction.description.toLowerCase().includes('opening balance')) {
        return {
          ...transaction,
          type: 'income',
          amount: Math.abs(transaction.amount)
        };
      }
      
      // Don't override UPI or other transactions - let AI analyze the WITHDRAWAL/DEPOSIT columns
      return transaction;
    });
    
    console.log(`🔧 Manual categorization applied to ${manuallyCategorizedTransactions.length} transactions`);
    return manuallyCategorizedTransactions;

  } catch (error) {
    console.error('AI transaction extraction failed:', error);
    throw error;
  }
}

function extractTransactionsFromExcel(data: Record<string, unknown>[]): Transaction[] {
  return data.map((row, index) => {
    // Common column mappings
    const transaction: Partial<Transaction> = {};
    
    // Try to find common column names
    const dateColumn = findColumn(row, ['date', 'Date', 'DATE', 'transaction_date', 'Transaction Date']);
    const descriptionColumn = findColumn(row, ['description', 'Description', 'DESCRIPTION', 'memo', 'Memo', 'details', 'Details']);
    const amountColumn = findColumn(row, ['amount', 'Amount', 'AMOUNT', 'transaction_amount', 'Transaction Amount']);
    const debitColumn = findColumn(row, ['debit', 'Debit', 'DEBIT', 'withdrawal', 'Withdrawal']);
    const creditColumn = findColumn(row, ['credit', 'Credit', 'CREDIT', 'deposit', 'Deposit']);
    
    transaction.date = dateColumn ? (row[dateColumn] as string) || '' : '';
    transaction.description = descriptionColumn ? (row[descriptionColumn] as string) || `Transaction ${index + 1}` : `Transaction ${index + 1}`;
    
    if (amountColumn) {
      transaction.amount = parseFloat(String(row[amountColumn]).replace(/[$,]/g, '')) || 0;
    } else if (debitColumn && creditColumn) {
      const debit = parseFloat(String(row[debitColumn]).replace(/[$,]/g, '')) || 0;
      const credit = parseFloat(String(row[creditColumn]).replace(/[$,]/g, '')) || 0;
      transaction.amount = credit > 0 ? credit : -debit;
    } else {
      transaction.amount = 0;
    }
    
    return transaction as Transaction;
  }).filter(tx => tx.date && tx.description);
}

function findColumn(row: Record<string, unknown>, possibleNames: string[]): string | null {
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
      return processPDF;
    case 'text/csv':
      return processCSV;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return processExcel;
    default:
      throw new Error(`Unsupported file type: ${fileType}. Please use CSV, Excel, or PDF files.`);
  }
}
