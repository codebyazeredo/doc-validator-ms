const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { validarCPF } = require('./cpf/validarCpf');
const { formatarCPF } = require('./cpf/formatarCpf');
const { gerarCPF } = require('./cpf/gerarCpf');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  });
  
app.use(limiter);
