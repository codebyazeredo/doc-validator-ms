const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { validarCPF } = require('./cpf/validarCpf');
const { formatarCPF } = require('./cpf/formatarCpf');
const { gerarCPF } = require('./cpf/gerarCpf');
const { validarCNPJ } = require('./cnpj/validarCnpj');
const { formatarCNPJ } = require('./cnpj/formatarCnpj');
const { gerarCNPJ } = require('./cnpj/gerarCnpj');
const { consultarCNPJ } = require('./cnpj/consultarCnpj');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

app.use(limiter);

app.post('/validate', (req, res) => {
  const doc = req.body.document;

  if (!doc || typeof doc !== 'string') {
    return res.status(400).json({ error: 'Documento inválido.' });
  }

  const normalized = doc.replace(/[^\d]+/g, '');
  let result = { valid: false, type: null, formatted: null };

  if (normalized.length === 11) {
    if (validarCPF(normalized)) {
      result = { valid: true, type: 'cpf', formatted: formatarCPF(normalized) };
    }
  } else if (normalized.length === 14) {
    if (validarCNPJ(normalized)) {
      result = { valid: true, type: 'cnpj', formatted: formatarCNPJ(normalized) };
    }
  }

  res.json(result);
});

app.post('/normalize', (req, res) => {
  const doc = req.body.document;

  if (!doc || typeof doc !== 'string') {
    return res.status(400).json({ error: 'Documento inválido.' });
  }

  const normalized = doc.replace(/\D/g, '');
  res.json({ normalized });
});

app.get('/generate/:type', (req, res) => {
  const { type } = req.params;

  if (type === 'cpf') {
    const cpf = gerarCPF();
    return res.json({ cpf: formatarCPF(cpf) });
  }

  if (type === 'cnpj') {
    const cnpj = gerarCNPJ();
    return res.json({ cnpj: formatarCNPJ(cnpj) });
  }

  res.status(400).json({ error: 'Tipo não suportado' });
});

app.post('/status/cnpj', async (req, res) => {
  const { cnpj } = req.body;

  if (!cnpj || typeof cnpj !== 'string') {
    return res.status(400).json({ error: 'CNPJ não informado ou inválido.' });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido.' });
  }

  const resultado = await consultarCNPJ(cnpjLimpo);
  res.json(resultado);
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});