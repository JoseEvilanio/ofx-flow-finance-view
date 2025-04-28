
// OFX transaction types
export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  balance?: number;
  memo?: string;
  // Additional fields can be added as needed
}

export interface Account {
  accountId: string;
  accountType: string;
  bankId?: string;
  transactions: Transaction[];
}

export interface OFXData {
  signOnInfo?: {
    dtServer?: string;
    language?: string;
    institute?: {
      name?: string;
      id?: string;
    };
  };
  accounts: Account[];
}
