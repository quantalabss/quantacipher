import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ingestRouter } from './routes/ingest';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large encrypted payloads from enterprises

// Routes
app.use('/api/v1/ingest', ingestRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'QuantaCipher Gateway' });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  QuantaCipher API Gateway running on port ${PORT}`);
  console.log(`  Zero-Trust Post-Quantum Architecture Active`);
  console.log(`======================================================\n`);
});
