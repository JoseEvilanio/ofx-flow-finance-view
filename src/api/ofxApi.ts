
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseOFXContent } from '@/utils/ofxParser';
import { getDefaultLocale } from '@/utils/localeUtils';

// Configuração do armazenamento temporário para arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Inicialização do Express
const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para processar arquivo OFX
app.post('/api/parse-ofx', upload.single('ofxFile'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Remover o arquivo após ler seu conteúdo
    fs.unlinkSync(filePath);
    
    // Processar o conteúdo OFX usando nossa função existente
    const parsedData = parseOFXContent(fileContent);
    
    // Formatar os dados para facilitar o uso no Bubble.io
    const formattedData = {
      accounts: parsedData.accounts.map(account => ({
        accountId: account.accountId,
        accountType: account.accountType,
        bankId: account.bankId || 'N/A',
        transactions: account.transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date.toISOString(),
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          memo: transaction.memo || '',
        }))
      })),
      locale: getDefaultLocale(),
      meta: {
        processingTimestamp: new Date().toISOString(),
        totalTransactions: parsedData.accounts.reduce(
          (total, account) => total + account.transactions.length, 0
        )
      }
    };
    
    res.json(formattedData);
    return;
  } catch (error) {
    console.error('Erro ao processar arquivo OFX:', error);
    res.status(500).json({ 
      error: 'Erro ao processar arquivo OFX',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return;
  }
});

// Endpoint de verificação de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
  return;
});

// Exportando o app para uso em servidor.ts
export default app;
