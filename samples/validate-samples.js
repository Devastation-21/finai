const fs = require('fs');
const path = require('path');

// Function to validate CSV file
function validateCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      return { valid: false, error: 'File must have at least header and one data row' };
    }
    
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      return { valid: false, error: `Missing headers: ${missingHeaders.join(', ')}` };
    }
    
    const dataRows = lines.slice(1);
    const issues = [];
    
    dataRows.forEach((row, index) => {
      const columns = row.split(',');
      if (columns.length !== 5) {
        issues.push(`Row ${index + 2}: Incorrect number of columns`);
      }
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(columns[0])) {
        issues.push(`Row ${index + 2}: Invalid date format`);
      }
      
      // Validate amount
      if (isNaN(parseFloat(columns[2]))) {
        issues.push(`Row ${index + 2}: Invalid amount`);
      }
      
      // Validate type
      if (!['Income', 'Expense'].includes(columns[4].trim())) {
        issues.push(`Row ${index + 2}: Type must be 'Income' or 'Expense'`);
      }
    });
    
    return {
      valid: issues.length === 0,
      totalRows: dataRows.length,
      issues: issues
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Validate all CSV files
const csvFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.csv'));

console.log('🔍 Validating Sample CSV Files...\n');

csvFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const result = validateCSV(filePath);
  
  console.log(`📄 ${file}:`);
  if (result.valid) {
    console.log(`   ✅ Valid (${result.totalRows} transactions)`);
  } else {
    console.log(`   ❌ Invalid:`);
    if (result.error) {
      console.log(`      ${result.error}`);
    }
    if (result.issues) {
      result.issues.forEach(issue => console.log(`      ${issue}`));
    }
  }
  console.log('');
});

console.log('✨ Validation complete!');
