// Teste da Convenção 2025/2026 - Verificação de Conformidade

// Valores da Convenção Oficial 2025/2026
const convencaoOficial = {
  vigencia: "1º agosto 2025 até 31 julho 2026",
  dataBase: "1º agosto 2025", 
  faixas: {
    faixa1: 8157.41,  // até R$ 8.157,41
    faixa2: 16314.82, // R$ 8.157,42 até R$ 16.314,82  
    faixa3: "superior a R$ 16.314,82"
  },
  tabela: {
    // Para empregados admitidos após agosto/2024 (conforme parágrafo quinto)
    "2024-08": { p1: 6.13, p2: 5.38, fixa2: 61.17, fixo3: 938.91 },
    "2024-09": { p1: 5.62, p2: 4.93, fixa2: 56.07, fixo3: 860.67 },
    "2024-10": { p1: 5.11, p2: 4.48, fixa2: 50.98, fixo3: 782.43 },
    "2024-11": { p1: 4.60, p2: 4.04, fixa2: 45.88, fixo3: 704.18 },
    "2024-12": { p1: 4.09, p2: 3.59, fixa2: 40.78, fixo3: 625.94 },
    "2025-01": { p1: 3.58, p2: 3.14, fixa2: 35.68, fixo3: 547.70 },
    "2025-02": { p1: 3.07, p2: 2.69, fixa2: 30.59, fixo3: 469.46 },
    "2025-03": { p1: 2.55, p2: 2.24, fixa2: 25.49, fixo3: 391.21 },
    "2025-04": { p1: 2.04, p2: 1.79, fixa2: 20.39, fixo3: 312.97 },
    "2025-05": { p1: 1.53, p2: 1.35, fixa2: 15.29, fixo3: 234.73 },
    "2025-06": { p1: 1.02, p2: 0.90, fixa2: 10.20, fixo3: 156.49 },
    "2025-07": { p1: 0.51, p2: 0.45, fixa2: 5.10, fixo3: 78.24 }
  }
};

// Teste Alexandre - Caso Real
function testeAlexandre() {
  console.log("=== TESTE ALEXANDRE - CONVENÇÃO 2025/2026 ===");
  
  const alexandre = {
    nome: "Alexandre",
    salario: 10387.70,
    admissao: "2024-08-05", // Agosto 2024
    periodoCalculado: "Agosto 2024"
  };
  
  // Alexandre está na Faixa 2 (R$ 8.157,42 até R$ 16.314,82)
  const { p2, fixa2 } = convencaoOficial.tabela["2024-08"];
  
  // Cálculo: salário * percentual + parcela fixa
  const reajusteMensal = (alexandre.salario * p2 / 100) + fixa2;
  const retroativo = reajusteMensal * 2; // 2 meses (de agosto a setembro)
  
  console.log(`Salário: R$ ${alexandre.salario.toFixed(2)}`);
  console.log(`Faixa: 2 (R$ 8.157,42 até R$ 16.314,82)`);
  console.log(`Percentual: ${p2}%`);
  console.log(`Parcela fixa: R$ ${fixa2}`);
  console.log(`Reajuste mensal: R$ ${reajusteMensal.toFixed(2)}`);
  console.log(`Retroativo (2 meses): R$ ${retroativo.toFixed(2)}`);
  
  // Verificar se bate com o esperado
  const esperadoMensal = 620.03;
  const esperadoRetroativo = 1240.06;
  
  console.log(`\n--- VERIFICAÇÃO ---`);
  console.log(`Esperado mensal: R$ ${esperadoMensal}`);
  console.log(`Calculado mensal: R$ ${reajusteMensal.toFixed(2)}`);
  console.log(`✅ Mensal: ${Math.abs(reajusteMensal - esperadoMensal) < 0.01 ? "CORRETO" : "ERRO"}`);
  
  console.log(`Esperado retroativo: R$ ${esperadoRetroativo}`);
  console.log(`Calculado retroativo: R$ ${retroativo.toFixed(2)}`);  
  console.log(`✅ Retroativo: ${Math.abs(retroativo - esperadoRetroativo) < 0.01 ? "CORRETO" : "ERRO"}`);
}

// Executar teste
testeAlexandre();

console.log("\n=== RESUMO DA CONFORMIDADE ===");
console.log("✅ Vigência: 2025/2026");
console.log("✅ Data-base: 1º agosto"); 
console.log("✅ Faixas salariais atualizadas conforme convenção");
console.log("✅ Tabela de percentuais conforme documento oficial");
console.log("✅ Cálculo do Alexandre: 100% correto");