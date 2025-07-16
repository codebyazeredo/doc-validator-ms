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
const { logRequisicao } = require('./utils/logger');
const { construirLog } = require('./utils/logger');

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
    const log = construirLog(req, 'validacao_documento', doc, { error: 'Documento inválido' });
    logRequisicao(req, 'validacao_documento', doc, { error: 'Documento inválido' });

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

  const log = construirLog(req, 'validacao_documento', normalized, result);
  logRequisicao(req, 'validacao_documento', normalized, result);

  res.json({ ...result, ...log });
});

app.post('/normalize', (req, res) => {
  const doc = req.body.document;

  if (!doc || typeof doc !== 'string') {
    const log = construirLog(req, 'normalize', doc, { error: 'Documento inválido' });
    logRequisicao(req, 'normalize', doc, { error: 'Documento inválido' });

    return res.status(400).json({ ...log, error: 'Documento inválido.' });
  }

  const normalized = doc.replace(/\D/g, '');
  const result = { normalized };

  const log = construirLog(req, 'normalize', normalized, result);
  logRequisicao(req, 'normalize', normalized, result);

  res.json({ ...result, ...log });
});

app.get('/generate/:type', (req, res) => {
  const { type } = req.params;

  let result;
  if (type === 'cpf') {
    const cpf = gerarCPF();
    result = { cpf: formatarCPF(cpf) };
  } else if (type === 'cnpj') {
    const cnpj = gerarCNPJ();
    result = { cnpj: formatarCNPJ(cnpj) };
  } else {
    const log = construirLog(req, 'geracao_documento', type, { error: 'Tipo não suportado' });
    logRequisicao(req, 'geracao_documento', type, { error: 'Tipo não suportado' });

    return res.status(400).json({ ...log, error: 'Tipo não suportado' });
  }

  const doc = result.cpf || result.cnpj;
  const log = construirLog(req, 'geracao_documento', doc, result);
  logRequisicao(req, 'geracao_documento', doc, result);

  res.json({ ...result, ...log });
});

app.post('/status/cnpj', async (req, res) => {
  const { cnpj } = req.body;

  if (!cnpj || typeof cnpj !== 'string') {
    const log = construirLog(req, 'consulta_cnpj', cnpj, { error: 'CNPJ não informado' });
    logRequisicao(req, 'consulta_cnpj', cnpj, { error: 'CNPJ não informado' });

    return res.status(400).json({ error: 'CNPJ não informado ou inválido.' });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) {
    const log = construirLog(req, 'consulta_cnpj', cnpjLimpo, { error: 'CNPJ inválido' });
    logRequisicao(req, 'consulta_cnpj', cnpjLimpo, { error: 'CNPJ inválido' });

    return res.status(400).json({ error: 'CNPJ inválido.' });
  }

  const resultado = await consultarCNPJ(cnpjLimpo);

  const log = construirLog(req, 'consulta_cnpj', cnpjLimpo, resultado);
  logRequisicao(req, 'consulta_cnpj', cnpjLimpo, resultado);

  return res.json({ ...resultado, ...log });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});