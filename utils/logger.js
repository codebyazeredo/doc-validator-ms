const fs = require('fs');
const path = require('path');

const LOG_ATIVO = process.env.LOG_ATIVO === 'true';
const logFile = path.join(__dirname, '../logs/consultas.log');

function construirLog(req, tipo, doc, resultado = {}) {
    return {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        metodo: req.method,
        rota: req.originalUrl,
        tipo,
        doc_consultado: doc,
        status: resultado?.situacao || resultado?.error || 'N/A'
    };
}

function logRequisicao(req, tipo, doc, resultado = {}) {
    if (!LOG_ATIVO) return;

    const dados = construirLog(req, tipo, doc, resultado);
    const linha = `[${dados.timestamp}] | IP: ${dados.ip} | Método: ${dados.metodo} | Rota: ${dados.rota} | Tipo: ${dados.tipo} | Doc: ${dados.documento} | Status: ${dados.status}\n`;

    fs.appendFileSync(logFile, linha);
}

module.exports = {
    logRequisicao,
    construirLog
};
