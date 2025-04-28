
import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/ofx';
import { formatCurrency, formatDate } from '@/utils/ofxParser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Apply type filter
      const matchesType = typeFilter === 'ALL' || transaction.type === typeFilter;
      
      // Apply search filter (case insensitive)
      const matchesSearch = !searchTerm || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.memo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchTerm]);

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-40">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CREDIT">Credits</SelectItem>
              <SelectItem value="DEBIT">Debits</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setTypeFilter('ALL');
          }}
        >
          Clear Filters
        </Button>
      </div>

      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium truncate">{transaction.description}</div>
                  {transaction.memo && transaction.memo !== transaction.description && (
                    <div className="text-sm text-gray-500 truncate">{transaction.memo}</div>
                  )}
                  <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                </div>
                <div className={`text-right font-medium ${
                  transaction.type === 'CREDIT' 
                    ? 'text-finance-credit' 
                    : 'text-finance-debit'
                }`}>
                  {transaction.type === 'CREDIT' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions match your filters.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('ALL');
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
