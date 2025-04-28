
import React, { useMemo } from 'react';
import { Transaction } from '@/types/ofx';
import { formatCurrency } from '@/utils/ofxParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccountSummaryProps {
  transactions: Transaction[];
  accountId: string;
  accountType: string;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ 
  transactions, 
  accountId,
  accountType 
}) => {
  const summary = useMemo(() => {
    // Calculate totals
    const totalCredits = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalDebits = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netAmount = totalCredits - totalDebits;
    
    // Find date range
    const dates = transactions.map(t => t.date.getTime());
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    return {
      totalTransactions: transactions.length,
      totalCredits,
      totalDebits,
      netAmount,
      oldestDate,
      newestDate,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={accountId}>
            {accountId}
          </div>
          <p className="text-xs text-gray-500 mt-1">Type: {accountType}</p>
          <p className="text-xs text-gray-500">
            {summary.oldestDate.toLocaleDateString()} - {summary.newestDate.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm">Credits</div>
            <div className="text-xl font-medium text-finance-credit">
              {formatCurrency(summary.totalCredits)}
            </div>
          </div>
          <div>
            <div className="text-sm">Debits</div>
            <div className="text-xl font-medium text-finance-debit">
              {formatCurrency(summary.totalDebits)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Net Change</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            summary.netAmount >= 0 ? 'text-finance-credit' : 'text-finance-debit'
          }`}>
            {formatCurrency(summary.netAmount)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {summary.totalTransactions} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSummary;
