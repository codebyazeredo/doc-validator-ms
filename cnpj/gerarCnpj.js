function gerarCNPJ() {
    const random = () => Math.floor(Math.random() * 9);
    let n = Array.from({ length: 8 }, () => random());

    n = [...n, 0, 0, 0, 1];

    const calcDig = (base) => {
        const multiplicadores = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const soma = base.reduce((acc, val, i) => acc + val * multiplicadores[i + (14 - base.length)], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const d1 = calcDig(n);
    const d2 = calcDig([...n, d1]);

    return [...n, d1, d2].join('');
}

module.exports = { gerarCNPJ };
