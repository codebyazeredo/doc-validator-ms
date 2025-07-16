function gerarCPF() {
  let n = [];
  for (let i = 0; i < 9; i++) n[i] = Math.floor(Math.random() * 9);
  const calcDig = (arr) => {
      let soma = 0;
      for (let i = 0; i < arr.length; i++) soma += arr[i] * (arr.length + 1 - i);
      let resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
  };
  n[9] = calcDig(n);
  n[10] = calcDig(n.slice(0, 10));

  return n.join('');
}

module.exports = { gerarCPF };