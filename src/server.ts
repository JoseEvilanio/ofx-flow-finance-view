
import app from './api/ofxApi';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor OFX API rodando na porta ${PORT}`);
  console.log(`API de saúde disponível em: http://localhost:${PORT}/api/health`);
  console.log(`Endpoint para processar OFX: http://localhost:${PORT}/api/parse-ofx`);
});
