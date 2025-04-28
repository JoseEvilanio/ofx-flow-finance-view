
import { OFXData, Transaction, Account } from '@/types/ofx';

export async function parseOFXFile(file: File): Promise<OFXData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target || typeof e.target.result !== 'string') {
          throw new Error('Failed to read the file');
        }
        
        const content = e.target.result;
        const result = parseOFXContent(content);
        resolve(result);
      } catch (error) {
        console.error('Error parsing OFX file:', error);
        reject(new Error('Invalid OFX file format. Please check the file and try again.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsText(file);
  });
}

function parseOFXContent(content: string): OFXData {
  // Check if the file contains OFX data
  if (!content.includes('<OFX>') && !content.includes('<ofx>')) {
    throw new Error('Not a valid OFX file');
  }

  const data: OFXData = {
    accounts: []
  };

  let currentAccount: Account | null = null;

  // Basic parsing of OFX content by looking for key tags
  // Note: A production-level parser would need to be more robust
  // Extract account info
  const accountMatches = content.match(/<ACCTID>([^<]+)/gi);
  const accountTypeMatches = content.match(/<ACCTTYPE>([^<]+)/gi);
  
  if (accountMatches && accountMatches.length > 0) {
    const accountId = accountMatches[0].replace(/<ACCTID>|<acctid>/i, '').trim();
    const accountType = accountTypeMatches && accountTypeMatches[0] 
      ? accountTypeMatches[0].replace(/<ACCTTYPE>|<accttype>/i, '').trim() 
      : 'UNKNOWN';
    
    currentAccount = {
      accountId,
      accountType,
      transactions: []
    };
    
    data.accounts.push(currentAccount);
  }

  // Extract bank info if available
  const bankIdMatches = content.match(/<BANKID>([^<]+)/i);
  if (bankIdMatches && bankIdMatches.length > 1 && currentAccount) {
    currentAccount.bankId = bankIdMatches[1];
  }

  // Extract transactions
  const transactionSegments = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];

  for (const segment of transactionSegments) {
    const transaction: Partial<Transaction> = {
      type: 'DEBIT', // Default
      amount: 0,
      description: 'Unknown transaction'
    };

    // Transaction ID
    const idMatch = segment.match(/<FITID>([^<]+)/i);
    if (idMatch && idMatch.length > 1) {
      transaction.id = idMatch[1];
    } else {
      transaction.id = `txn-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Transaction date
    const dateMatch = segment.match(/<DTPOSTED>([^<]+)/i);
    if (dateMatch && dateMatch.length > 1) {
      // OFX dates are often in format YYYYMMDD
      const dateStr = dateMatch[1];
      
      if (dateStr.length >= 8) {
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-based
        const day = parseInt(dateStr.substring(6, 8), 10);
        
        transaction.date = new Date(year, month, day);
      } else {
        transaction.date = new Date(); // Fallback to current date
      }
    } else {
      transaction.date = new Date();
    }

    // Transaction amount
    const amountMatch = segment.match(/<TRNAMT>([^<]+)/i);
    if (amountMatch && amountMatch.length > 1) {
      const amount = parseFloat(amountMatch[1]);
      transaction.amount = amount;
      transaction.type = amount >= 0 ? 'CREDIT' : 'DEBIT';
    }

    // Transaction description/memo
    const nameMatch = segment.match(/<NAME>([^<]+)/i);
    if (nameMatch && nameMatch.length > 1) {
      transaction.description = nameMatch[1];
    }

    const memoMatch = segment.match(/<MEMO>([^<]+)/i);
    if (memoMatch && memoMatch.length > 1) {
      transaction.memo = memoMatch[1];
      // If no description was found, use memo as the description
      if (!transaction.description || transaction.description === 'Unknown transaction') {
        transaction.description = memoMatch[1];
      }
    }

    if (currentAccount && transaction.id) {
      // Add the transaction to the current account
      currentAccount.transactions.push(transaction as Transaction);
    }
  }

  // Sort transactions by date (most recent first)
  data.accounts.forEach(account => {
    account.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  return data;
}

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format dates
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
