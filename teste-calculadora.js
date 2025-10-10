// Script de teste para validar cálculos da calculadora SEAAC
// Simulando a lógica de cálculo para verificar se está correta

const dadosReais = [
  { salario: 6182.48, admissao: '2020-08' },
  { salario: 3500.00, admissao: '2022-10' },
  { salario: 4345.28, admissao: '2022-11' },
  { salario: 3151.80, admissao: '2023-03' },
  { salario: 2071.83, admissao: '2023-05' },
  { salario: 4622.14, admissao: '2023-06' },
  { salario: 3098.67, admissao: '2023-07' },
  { salario: 2394.00, admissao: '2024-03' },
  { salario: 8167.64, admissao: '2024-03' },
  { salario: 4300.00, admissao: '2024-11' },
  { salario: 5500.00, admissao: '2025-02' },
  { salario: 4300.00, admissao: '2025-03' },
  { salario: 3500.00, admissao: '2025-06' },
  { salario: 2000.00, admissao: '2025-07' }
];

// Constantes da calculadora
const cap1 = 2640.00;
const cap2 = 4400.00;
const percent1 = 10.0;
const percent2 = 8.0;
const percent3 = 6.0;
const percent4 = 4.0;
const percent5 = 2.0;
const parcelaFixa2 = 52.80;
const valorFixo3 = 264.00;

// Tabela proporcional (dados fictícios para teste)
const tabelaProporcional = {
  'ago/2024': { p1: 9.0, p2: 7.2, fixa2: 47.52, fixo3: 237.6 },
  'set/2024': { p1: 8.0, p2: 6.4, fixa2: 42.24, fixo3: 211.2 },
  'out/2024': { p1: 7.0, p2: 5.6, fixa2: 36.96, fixo3: 184.8 },
  'nov/2024': { p1: 6.0, p2: 4.8, fixa2: 31.68, fixo3: 158.4 },
  'dez/2024': { p1: 5.0, p2: 4.0, fixa2: 26.4, fixo3: 132.0 },
  'jan/2025': { p1: 4.0, p2: 3.2, fixa2: 21.12, fixo3: 105.6 },
  'fev/2025': { p1: 3.0, p2: 2.4, fixa2: 15.84, fixo3: 79.2 },
  'mar/2025': { p1: 2.0, p2: 1.6, fixa2: 10.56, fixo3: 52.8 },
  'abr/2025': { p1: 1.0, p2: 0.8, fixa2: 5.28, fixo3: 26.4 },
  'mai/2025': { p1: 0.5, p2: 0.4, fixa2: 2.64, fixo3: 13.2 },
  'jun/2025': { p1: 0.25, p2: 0.2, fixa2: 1.32, fixo3: 6.6 },
  'jul/2025': { p1: 0.125, p2: 0.1, fixa2: 0.66, fixo3: 3.3 }
};

function calcularReajuste(salario, admissao) {
  const dataAdmissao = new Date(admissao + '-01');
  const dataBase = new Date('2024-08-01');
  const isAntesDaDataBase = dataAdmissao < dataBase;
  
  let reajuste, regraAplicada;
  const mesesRetroativos = 2; // Todos recebem 2 meses
  
  if (isAntesDaDataBase || !tabelaProporcional[admissao]) {
    // Reajuste integral (6.13% total)
    if (salario <= cap1) {
      reajuste = (salario * percent1) / 100;
      regraAplicada = `Reajuste integral - Faixa 1: ${percent1}%`;
    } else if (salario <= cap2) {
      reajuste = (salario * percent2) / 100 + parcelaFixa2;
      regraAplicada = `Reajuste integral - Faixa 2: ${percent2}% + R$ ${parcelaFixa2}`;
    } else {
      reajuste = valorFixo3;
      regraAplicada = `Reajuste integral - Faixa 3: R$ ${valorFixo3}`;
    }
  } else {
    // Tabela proporcional
    const entry = tabelaProporcional[admissao] || tabelaProporcional['jul/2025'];
    
    if (salario <= cap1) {
      reajuste = (salario * entry.p1) / 100;
      regraAplicada = `Faixa 1: ${entry.p1}%`;
    } else if (salario <= cap2) {
      reajuste = (salario * entry.p2) / 100 + entry.fixa2;
      regraAplicada = `Faixa 2: ${entry.p2}% + R$ ${entry.fixa2}`;
    } else {
      reajuste = entry.fixo3;
      regraAplicada = `Faixa 3: R$ ${entry.fixo3}`;
    }
  }
  
  const novoSalario = salario + reajuste;
  const valorRetroativo = reajuste * mesesRetroativos;
  const totalReceber = novoSalario + valorRetroativo;
  
  return {
    salarioAtual: salario,
    reajuste: reajuste,
    novoSalario: novoSalario,
    mesesRetroativos: mesesRetroativos,
    valorRetroativo: valorRetroativo,
    totalReceber: totalReceber,
    regraAplicada: regraAplicada
  };
}

console.log('=== TESTE DA CALCULADORA SEAAC ===\n');

dadosReais.forEach((funcionario, index) => {
  const resultado = calcularReajuste(funcionario.salario, funcionario.admissao);
  
  console.log(`Funcionário ${index + 1}:`);
  console.log(`  Salário Atual: R$ ${funcionario.salario.toFixed(2)}`);
  console.log(`  Admissão: ${funcionario.admissao}`);
  console.log(`  Reajuste: R$ ${resultado.reajuste.toFixed(2)}`);
  console.log(`  Novo Salário: R$ ${resultado.novoSalario.toFixed(2)}`);
  console.log(`  Retroativo (${resultado.mesesRetroativos} meses): R$ ${resultado.valorRetroativo.toFixed(2)}`);
  console.log(`  Total a Receber: R$ ${resultado.totalReceber.toFixed(2)}`);
  console.log(`  Regra: ${resultado.regraAplicada}`);
  console.log('---');
});

// Teste específico para validar casos importantes
console.log('\n=== CASOS DE TESTE ESPECÍFICOS ===\n');

// Caso 1: Funcionário antes de 01/08/2024 (deve receber reajuste integral)
const caso1 = calcularReajuste(3000, '2020-08');
console.log('Caso 1 - Funcionário antigo (2020):');
console.log(`  Reajuste: R$ ${caso1.reajuste.toFixed(2)} (esperado: 10% = R$ 300.00)`);
console.log(`  Retroativo: R$ ${caso1.valorRetroativo.toFixed(2)} (esperado: 2 meses)`);

// Caso 2: Funcionário março/2024 (sem entrada na tabela, deve receber reajuste integral)
const caso2 = calcularReajuste(4000, '2024-03');
console.log('\nCaso 2 - Funcionário março/2024 (sem tabela):');
console.log(`  Reajuste: R$ ${caso2.reajuste.toFixed(2)} (esperado: 8% + R$ 52.80 = R$ 372.80)`);
console.log(`  Retroativo: R$ ${caso2.valorRetroativo.toFixed(2)} (esperado: 2 meses)`);

// Caso 3: Funcionário novembro/2024 (deve usar tabela proporcional)
const caso3 = calcularReajuste(3000, '2024-11');
console.log('\nCaso 3 - Funcionário novembro/2024 (tabela proporcional):');
console.log(`  Reajuste: R$ ${caso3.reajuste.toFixed(2)} (esperado: conforme tabela)`);
console.log(`  Retroativo: R$ ${caso3.valorRetroativo.toFixed(2)} (esperado: 2 meses)`);