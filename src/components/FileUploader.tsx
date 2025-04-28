
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { parseOFXFile } from '@/utils/ofxParser';
import { OFXData } from '@/types/ofx';
import { ArrowUpFromLine } from 'lucide-react';

interface FileUploaderProps {
  onFileProcessed: (data: OFXData) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileProcessed,
  isProcessing,
  setIsProcessing
}) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const processFile = useCallback(async (file: File) => {
    // Check if the file is an OFX file by extension
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid .ofx file",
      });
      return;
    }
    
    setIsProcessing(true);
    setSelectedFile(file);
    
    try {
      const parsedData = await parseOFXFile(file);
      onFileProcessed(parsedData);
      
      toast({
        title: "File processed successfully!",
        description: `Loaded ${parsedData.accounts.reduce((total, account) => 
          total + account.transactions.length, 0)} transactions`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, setIsProcessing, toast]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } cursor-pointer animate-fade-in`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".ofx"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-slate-100 p-4">
            <ArrowUpFromLine className="w-6 h-6 text-slate-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">
              {isProcessing ? 'Processing...' : 'Upload OFX File'}
            </h3>
            
            <p className="text-sm text-gray-500 mt-1">
              {selectedFile ? selectedFile.name : 'Drag and drop or click to browse'}
            </p>
            
            {isProcessing && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-r-2 mx-auto"></div>
              </div>
            )}
          </div>
          
          {!isProcessing && !selectedFile && (
            <Button variant="outline" size="sm" className="mt-2">
              Select File
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
