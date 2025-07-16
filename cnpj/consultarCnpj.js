require('dotenv').config();

const axios = require('axios');
const { validarCNPJ } = require('./validarCnpj');
const { formatarCNPJ } = require('./formatarCnpj');
const cache = new Map();

function getCachedCNPJ(cnpj) {
    const item = cache.get(cnpj);

    if (!item || item.expiresAt < Date.now()) {
        cache.delete(cnpj);
        return null;
    }

    return item.dados;
}

function setCachedCNPJ(cnpj, dados, ttlMs = 24 * 60 * 60 * 1000) {
    cache.set(cnpj, { dados, expiresAt: Date.now() + ttlMs });
}

async function consultarCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (!validarCNPJ(cnpjLimpo)) {
        return { cnpj, valido: false, formatado: null, error: 'CNPJ inválido', };
    }

    const cacheado = getCachedCNPJ(cnpjLimpo);
    
    if (cacheado) {
        return cacheado
    };

    try {
        const res = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
        const data = res.data;
        const resposta = {
            cnpj: cnpjLimpo,
            formatado: formatarCNPJ(cnpjLimpo),
            valido: true,
            razao_social: data.razao_social,
            nome_fantasia: data.estabelecimento?.nome_fantasia,
            situacao: data.estabelecimento?.situacao_cadastral,
            data_inicio_atividade: data.estabelecimento?.data_inicio_atividade,
            cnae: data.estabelecimento?.atividade_principal?.descricao,
            capital_social: data.capital_social,
            endereco: `${data.estabelecimento.logradouro}, ${data.estabelecimento.numero} - ${data.estabelecimento.bairro} - ${data.estabelecimento.cidade.nome}/${data.estabelecimento.estado.sigla}`
          };

          setCachedCNPJ(cnpjLimpo, resposta);
          return resposta;
    } catch (e) {
        return { cnpj: cnpjLimpo, valido: true, formatado: formatarCNPJ(cnpjLimpo), error: 'Erro ao consultar API cnpj.ws' };
    }
}

module.exports = { consultarCNPJ };
