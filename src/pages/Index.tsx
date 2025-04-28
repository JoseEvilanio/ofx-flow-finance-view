
import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import TransactionList from '@/components/TransactionList';
import AccountSummary from '@/components/AccountSummary';
import { OFXData } from '@/types/ofx';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const [ofxData, setOfxData] = useState<OFXData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  const handleFileProcessed = (data: OFXData) => {
    setOfxData(data);
    setSelectedAccountIndex(0); // Reset to first account
  };

  // Reset everything
  const handleReset = () => {
    setOfxData(null);
    setSelectedAccountIndex(0);
  };

  // Get current account and transactions
  const currentAccount = ofxData?.accounts[selectedAccountIndex];
  const transactions = currentAccount?.transactions || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">OFX Transaction Viewer</h1>
          <p className="text-gray-600">Upload and analyze your bank transactions</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!ofxData ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">Upload your OFX file</h2>
              <p className="text-gray-600">
                Select or drag and drop your bank statement (.ofx file)
              </p>
            </div>
            
            <FileUploader 
              onFileProcessed={handleFileProcessed} 
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-md font-medium text-blue-800 mb-2">What is an OFX file?</h3>
              <p className="text-sm text-blue-600">
                OFX (Open Financial Exchange) is a data format used by financial institutions 
                to exchange financial information. Most banks allow you to download your account 
                statements in OFX format.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Account switcher if multiple accounts */}
            {ofxData.accounts.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {ofxData.accounts.map((account, index) => (
                  <Button
                    key={account.accountId}
                    variant={selectedAccountIndex === index ? "default" : "outline"}
                    onClick={() => setSelectedAccountIndex(index)}
                    className="text-sm"
                  >
                    {account.accountType} {account.accountId.slice(-4)}
                  </Button>
                ))}
              </div>
            )}
            
            {currentAccount && (
              <>
                <AccountSummary 
                  transactions={transactions}
                  accountId={currentAccount.accountId}
                  accountType={currentAccount.accountType}
                />
                
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Transactions</h2>
                  <Button variant="outline" onClick={handleReset}>
                    Upload New File
                  </Button>
                </div>
                
                <TransactionList transactions={transactions} />
              </>
            )}
          </div>
        )}
      </main>
      
      <footer className="container mx-auto px-4 py-6 mt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>OFX Transaction Viewer - Upload, view and analyze your bank transactions</p>
      </footer>
    </div>
  );
};

export default Index;
