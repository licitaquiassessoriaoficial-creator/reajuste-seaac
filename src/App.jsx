import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";

// ---- helpers ----
const brl = (n) =>
  (isFinite(n) ? n : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

const pct = (n) => `${(isFinite(n) ? n : 0).toFixed(2)}%`;

const monthKey = (value) => {
  // recebe "YYYY-MM" de <input type="month">
  if (!value) return "";
  const [y, m] = value.split("-");
  return `${y}-${m}`;
};

const monthLabel = (key) => {
  if (!key) return "";
  const [y, m] = key.split("-");
  const nomes = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ];
  const mm = parseInt(m, 10) - 1;
  const txt = `${nomes[mm]}/${y}`;
  return txt.replace(/\b\w/g, (c) => c.toUpperCase());
};

// ---- defaults ----
// Tabela 2024-2025 (Oficial SEAAC) - Valores da imagem fornecida
const defaultRows2024_2025 = [
  { key: "2024-08", p1: 6.13, p2: 5.38, fixa2: 61.17, fixo3: 938.91 },
  { key: "2024-09", p1: 5.62, p2: 4.93, fixa2: 56.07, fixo3: 860.67 },
  { key: "2024-10", p1: 5.11, p2: 4.48, fixa2: 50.98, fixo3: 782.43 },
  { key: "2024-11", p1: 4.60, p2: 4.04, fixa2: 45.88, fixo3: 704.18 },
  { key: "2024-12", p1: 4.09, p2: 3.59, fixa2: 40.78, fixo3: 625.94 },
  { key: "2025-01", p1: 3.58, p2: 3.14, fixa2: 35.68, fixo3: 547.70 },
  { key: "2025-02", p1: 3.07, p2: 2.69, fixa2: 30.59, fixo3: 469.46 },
  { key: "2025-03", p1: 2.55, p2: 2.24, fixa2: 25.49, fixo3: 391.21 },
  { key: "2025-04", p1: 2.04, p2: 1.79, fixa2: 20.39, fixo3: 312.97 },
  { key: "2025-05", p1: 1.53, p2: 1.35, fixa2: 15.29, fixo3: 234.73 },
  { key: "2025-06", p1: 1.02, p2: 0.90, fixa2: 10.20, fixo3: 156.49 },
  { key: "2025-07", p1: 0.51, p2: 0.45, fixa2: 5.10, fixo3: 78.24 },
];

// Template para anos anteriores (valores zerados - preencher quando descobrir)
const templateYearsToAdd = [
  // 2023-2024 - PREENCHER COM VALORES REAIS QUANDO DESCOBRIR
  { key: "2023-08", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-09", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-10", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-11", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-12", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-01", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-02", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-03", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-04", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-05", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-06", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2024-07", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  
  // 2022-2023 - PREENCHER COM VALORES REAIS QUANDO DESCOBRIR
  { key: "2022-08", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2022-09", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2022-10", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2022-11", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2022-12", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-01", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-02", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-03", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-04", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-05", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-06", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
  { key: "2023-07", p1: 0, p2: 0, fixa2: 0, fixo3: 0 },
];

// Combinar todas as tabelas (anos anteriores + atual)
const defaultRows = [
  ...templateYearsToAdd,
  ...defaultRows2024_2025
];

export default function App() {
  // principais
  const [salary, setSalary] = useState(0);
  const [admission, setAdmission] = useState("2025-02");
  const [baseDate, setBaseDate] = useState("2025-08");
  const [retroativeMonths, setRetroativeMonths] = useState(2);

  // estados para mensagens
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // estados para novas funcionalidades
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("reajuste_dark_mode");
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("reajuste_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [csvData, setCsvData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // limites de faixa
  const [cap1, setCap1] = useState(8157.41);
  const [cap2, setCap2] = useState(16314.42);

  // tabela
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem("reajuste_proporcional_rows");
      if (saved) {
        const parsedRows = JSON.parse(saved);
        // Verifica se tem a estrutura correta, senão recarrega defaults
        if (parsedRows.length > 0 && parsedRows[0].hasOwnProperty('p1')) {
          return parsedRows;
        }
      }
    } catch (e) {}
    // Sempre carrega os valores padrão atualizados
    return defaultRows;
  });

  // Função para resetar para valores padrão
  const resetToDefault = () => {
    // Limpa localStorage
    localStorage.removeItem("reajuste_proporcional_rows");
    
    // Define os valores padrão
    setRows(defaultRows);
    
    // Salva no localStorage
    localStorage.setItem("reajuste_proporcional_rows", JSON.stringify(defaultRows));
    
    setMessage({ type: "success", text: "Tabela resetada para valores padrão!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  useEffect(() => {
    localStorage.setItem("reajuste_proporcional_rows", JSON.stringify(rows));
  }, [rows]);

  // Salvar configurações de tema
  useEffect(() => {
    localStorage.setItem("reajuste_dark_mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Salvar histórico
  useEffect(() => {
    localStorage.setItem("reajuste_history", JSON.stringify(history));
  }, [history]);

  // pegar a linha de referência
  const entry = rows.find((r) => r.key === admission);

  const percent1 = entry?.p1 ?? 0;
  const percent2 = entry?.p2 ?? 0;
  const parcelaFixa2 = entry?.fixa2 ?? 0;
  const valorFixo3 = entry?.fixo3 ?? 0;

  let reajuste = 0;
  let regraAplicada = "";

  // Verificar se a data de admissão existe na tabela
  if (!entry && admission) {
    regraAplicada = `⚠️ Mês ${monthLabel(admission)} não encontrado na tabela! Adicione esta competência ou ajuste a data.`;
  } else if (salary <= cap1) {
    reajuste = (salary * percent1) / 100;
    regraAplicada = `Faixa 1 (≤ ${brl(cap1)}): ${pct(percent1)} sobre o salário`;
  } else if (salary <= cap2) {
    reajuste = (salary * percent2) / 100 + parcelaFixa2;
    regraAplicada = `Faixa 2 (${brl(cap1)} a ${brl(cap2)}): ${pct(percent2)} + parcela fixa ${brl(parcelaFixa2)}`;
  } else {
    reajuste = valorFixo3;
    regraAplicada = `Faixa 3 (> ${brl(cap2)}): valor fixo ${brl(valorFixo3)}`;
  }

  const novoSalario = salary + reajuste;
  const valorRetroativo = reajuste * retroativeMonths;
  const totalAPagar = valorRetroativo;

  // Salvar cálculo no histórico
  const saveToHistory = () => {
    if (salary > 0) {
      const calculation = {
        id: Date.now(),
        date: new Date().toLocaleString("pt-BR"),
        admission: monthLabel(admission),
        salary,
        reajuste,
        novoSalario,
        regraAplicada,
        baseDate: monthLabel(baseDate),
        retroativeMonths,
        valorRetroativo,
        totalAPagar
      };
      setHistory(prev => [calculation, ...prev.slice(0, 49)]); // Manter apenas 50 últimos
      setMessage({ type: "success", text: "Cálculo salvo no histórico!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 2000);
    }
  };

  // Gerar PDF
  const generatePDF = async () => {
    try {
      const element = document.getElementById("calculation-result");
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      let position = 20;

      // Título
      pdf.setFontSize(16);
      pdf.text("Relatório de Reajuste SEAAC", 20, 15);
      
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      
      // Dados adicionais
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, pageHeight - 10);
      
      pdf.save(`reajuste-seaac-${admission}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setMessage({ type: "success", text: "PDF gerado com sucesso!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao gerar PDF!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Upload CSV
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const validData = result.data.filter(row => 
          row.salario && row.admissao && !isNaN(parseFloat(row.salario))
        );
        setCsvData(validData);
        setMessage({ type: "success", text: `${validData.length} registros carregados!` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      },
      error: () => {
        setMessage({ type: "error", text: "Erro ao processar CSV!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    });
    e.target.value = "";
  };

  // Calcular reajuste para CSV
  const calculateCSVReajuste = (salario, admissaoCSV) => {
    const entryCSV = rows.find((r) => r.key === admissaoCSV);
    if (!entryCSV) return { 
      reajuste: 0, 
      regraAplicada: "Mês não encontrado na tabela",
      valorRetroativo: 0 
    };

    const sal = parseFloat(salario);
    let reaj = 0;
    let regra = "";

    if (sal <= cap1) {
      reaj = (sal * entryCSV.p1) / 100;
      regra = `Faixa 1: ${entryCSV.p1}%`;
    } else if (sal <= cap2) {
      reaj = (sal * entryCSV.p2) / 100 + entryCSV.fixa2;
      regra = `Faixa 2: ${entryCSV.p2}% + R$ ${entryCSV.fixa2}`;
    } else {
      reaj = entryCSV.fixo3;
      regra = `Faixa 3: R$ ${entryCSV.fixo3}`;
    }

    const retroativo = reaj * retroativeMonths;

    return { 
      reajuste: reaj, 
      regraAplicada: regra,
      valorRetroativo: retroativo
    };
  };

  // Download exemplo CSV
  const downloadExampleCSV = () => {
    const exampleData = [
      { salario: "5000", admissao: "2025-02" },
      { salario: "10000", admissao: "2024-12" },
      { salario: "20000", admissao: "2025-01" },
      { salario: "3500", admissao: "2024-08" }
    ];
    
    // Configuração para garantir CSV correto
    const csv = Papa.unparse(exampleData, {
      delimiter: ",",
      header: true,
      quotes: false,
      quoteChar: '"',
      escapeChar: '"',
      skipEmptyLines: true,
      transform: {
        salario: (value) => value,
        admissao: (value) => value
      }
    });
    
    // Adiciona BOM para UTF-8 (resolve problemas de codificação)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemplo-reajuste-seaac.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage({ type: "success", text: "Exemplo CSV baixado! Use como modelo." });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Função para preencher anos anteriores (quando descobrir os valores)
  const preencherAnoAnterior = (ano, valores) => {
    // Exemplo de uso: preencherAnoAnterior("2023", arrayComValores2023)
    const mesesAno = [
      `${ano}-08`, `${ano}-09`, `${ano}-10`, `${ano}-11`, `${ano}-12`,
      `${parseInt(ano) + 1}-01`, `${parseInt(ano) + 1}-02`, `${parseInt(ano) + 1}-03`, 
      `${parseInt(ano) + 1}-04`, `${parseInt(ano) + 1}-05`, `${parseInt(ano) + 1}-06`, `${parseInt(ano) + 1}-07`
    ];
    
    setRows(prev => prev.map(row => {
      const index = mesesAno.indexOf(row.key);
      if (index !== -1 && valores[index]) {
        return { ...row, ...valores[index] };
      }
      return row;
    }));
    
    setMessage({ type: "success", text: `Valores do ano ${ano}-${parseInt(ano) + 1} atualizados!` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const updateRow = (idx, field, value) => {
    // Validação para meses repetidos
    if (field === "key") {
      const isDuplicate = rows.some((row, i) => i !== idx && row.key === value);
      if (isDuplicate && value) {
        setMessage({ type: "error", text: `O mês ${monthLabel(value)} já existe na tabela!` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }
    }

    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    const ultimo = rows[rows.length - 1]?.key || baseDate;
    const [y, m] = ultimo.split("-").map((x) => parseInt(x, 10));
    const d = new Date(y, m - 1, 1);
    d.setMonth(d.getMonth() + 1);
    const ny = d.getFullYear();
    const nm = String(d.getMonth() + 1).padStart(2, "0");
    const newKey = `${ny}-${nm}`;
    
    // Verificar se o mês já existe
    const isDuplicate = rows.some(row => row.key === newKey);
    if (isDuplicate) {
      setMessage({ type: "error", text: `O mês ${monthLabel(newKey)} já existe na tabela!` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    
    setRows((prev) => [...prev, { key: newKey, p1: 0, p2: 0, fixa2: 0, fixo3: 0 }]);
    setMessage({ type: "success", text: `Mês ${monthLabel(newKey)} adicionado com sucesso!` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const removeRow = (idx) => {
    if (rows.length <= 1) {
      setMessage({ type: "error", text: "Deve haver pelo menos uma linha na tabela!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    
    const removedMonth = monthLabel(rows[idx].key);
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setMessage({ type: "success", text: `Mês ${removedMonth} removido com sucesso!` });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const exportJSON = () => {
    try {
      const data = { cap1, cap2, rows };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tabela-reajuste.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Tabela exportada com sucesso!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao exportar tabela!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let hasChanges = false;
        
        if (typeof data.cap1 === "number") {
          setCap1(data.cap1);
          hasChanges = true;
        }
        if (typeof data.cap2 === "number") {
          setCap2(data.cap2);
          hasChanges = true;
        }
        if (Array.isArray(data.rows)) {
          setRows(data.rows);
          hasChanges = true;
        }
        
        if (hasChanges) {
          setMessage({ type: "success", text: "Tabela importada com sucesso!" });
        } else {
          setMessage({ type: "error", text: "Nenhum dado válido encontrado no arquivo!" });
        }
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch {
        setMessage({ type: "error", text: "Arquivo JSON inválido!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    };
    reader.readAsText(file);
    
    // Limpar o input para permitir reimportar o mesmo arquivo
    e.target.value = "";
  };

  return (
    <div className={`min-h-screen p-3 md:p-6 transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-slate-50 text-gray-900"
    }`}>
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-semibold">
                Calculadora de Reajuste Proporcional (SEAAC)
              </h1>
              <p className={`text-sm md:text-base max-w-3xl ${
                darkMode ? "text-gray-300" : "text-slate-600"
              }`}>
                Preencha a tabela de percentuais/parcela fixa por mês de admissão (proporcional),
                defina os limites salariais por faixa e informe o salário.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-2 rounded-xl shadow transition-colors ${
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
                title="Alternar tema"
              >
                {darkMode ? "🌞" : "🌙"}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-2 rounded-xl shadow transition-colors ${
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                📊 Histórico
              </button>
            </div>
          </div>
        </header>

        {/* Mensagens de feedback */}
        {message.text && (
          <div className={`rounded-2xl p-4 shadow-lg border-l-4 ${
            message.type === "success" 
              ? "bg-green-50 border-green-400 text-green-800" 
              : "bg-red-50 border-red-400 text-red-800"
          } ${darkMode && message.type === "success" 
              ? "bg-green-900 border-green-400 text-green-200"
              : darkMode && message.type === "error"
              ? "bg-red-900 border-red-400 text-red-200"
              : ""
          }`}>
            <div className="flex items-center">
              <span className="font-medium">
                {message.type === "success" ? "✅ Sucesso: " : "❌ Erro: "}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Período da Tabela Oficial */}
        <section className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className="text-lg font-medium mb-3">📅 Tabela de Reajustes SEAAC</h2>
          
          {/* Separar por anos */}
          {["2024-2025", "2023-2024", "2022-2023"].map((periodo) => {
            const [anoInicial, anoFinal] = periodo.split("-");
            
            // Filtro correto por período acadêmico (agosto a julho)
            const mesesPeriodo = rows.filter(row => {
              const [ano, mes] = row.key.split("-");
              const anoNum = parseInt(ano);
              const mesNum = parseInt(mes);
              
              if (periodo === "2024-2025") {
                return (anoNum === 2024 && mesNum >= 8) || (anoNum === 2025 && mesNum <= 7);
              } else if (periodo === "2023-2024") {
                return (anoNum === 2023 && mesNum >= 8) || (anoNum === 2024 && mesNum <= 7);
              } else if (periodo === "2022-2023") {
                return (anoNum === 2022 && mesNum >= 8) || (anoNum === 2023 && mesNum <= 7);
              }
              return false;
            });

            const temValores = mesesPeriodo.some(row => row.p1 > 0);
            
            return (
              <div key={periodo} className="mb-4">
                <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                  temValores 
                    ? darkMode ? "text-green-400" : "text-green-600"
                    : darkMode ? "text-yellow-400" : "text-orange-600"
                }`}>
                  {temValores ? "✅" : "⚠️"} 
                  {periodo} ({temValores ? "Valores Preenchidos" : "Aguardando Valores"})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                  {mesesPeriodo.map((row) => (
                    <div
                      key={row.key}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-colors ${
                        admission === row.key
                          ? darkMode
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-blue-500 border-blue-400 text-white"
                          : row.p1 > 0
                            ? darkMode
                              ? "bg-green-800 border-green-600 hover:bg-green-700"
                              : "bg-green-50 border-green-200 hover:bg-green-100"
                            : darkMode
                              ? "bg-yellow-800 border-yellow-600 hover:bg-yellow-700"
                              : "bg-orange-50 border-orange-200 hover:bg-orange-100"
                      }`}
                      onClick={() => setAdmission(row.key)}
                      title={`${monthLabel(row.key)} - ${row.p1 > 0 ? `${pct(row.p1)}` : "Sem valores"}`}
                    >
                      <div className="font-medium">{monthLabel(row.key)}</div>
                      <div className={`text-xs ${
                        admission === row.key 
                          ? "text-blue-100" 
                          : row.p1 > 0 
                            ? "text-green-600" 
                            : "text-orange-500"
                      }`}>
                        {row.p1 > 0 ? pct(row.p1) : "0%"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className={`p-3 rounded-lg border-l-4 border-blue-400 ${
            darkMode ? "bg-blue-900/30" : "bg-blue-50"
          }`}>
            <h4 className={`font-medium ${darkMode ? "text-blue-200" : "text-blue-800"}`}>
              💡 Como Preencher Anos Anteriores:
            </h4>
            <ol className={`text-sm mt-2 space-y-1 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
              <li>1. <strong>Acesse:</strong> site oficial do SEAAC (seaac.com.br)</li>
              <li>2. <strong>Procure:</strong> "Acordos Coletivos" ou "Convenções"</li>
              <li>3. <strong>Baixe:</strong> tabelas de reajuste dos anos anteriores</li>
              <li>4. <strong>Edite:</strong> os valores na tabela abaixo (meses com 0%)</li>
            </ol>
            
            {/* Botões para desenvolvedores testarem */}
            <div className={`mt-3 p-2 rounded-md ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <p className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                🔧 <strong>Para desenvolvedores:</strong> teste preenchimento automático
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    // Exemplo: preencher 2023 com valores de exemplo
                    const valores2023 = [
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // ago/2023
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // set/2023
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // out/2023
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // nov/2023
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // dez/2023
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // jan/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // fev/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // mar/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // abr/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // mai/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // jun/2024
                      {p1: 0.0485, p2: 0.0292, p3: 0.0146}, // jul/2024
                    ];
                    preencherAnoAnterior("2023", valores2023);
                  }}
                  className={`px-2 py-1 text-xs rounded-md ${
                    darkMode 
                      ? "bg-yellow-700 hover:bg-yellow-600 text-yellow-100" 
                      : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
                  }`}
                >
                  Teste 2023
                </button>
                <button
                  onClick={() => {
                    // Exemplo: preencher 2022 com valores de exemplo  
                    const valores2022 = [
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // ago/2022
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // set/2022
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // out/2022
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // nov/2022
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // dez/2022
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // jan/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // fev/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // mar/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // abr/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // mai/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // jun/2023
                      {p1: 0.0420, p2: 0.0252, p3: 0.0126}, // jul/2023
                    ];
                    preencherAnoAnterior("2022", valores2022);
                  }}
                  className={`px-2 py-1 text-xs rounded-md ${
                    darkMode 
                      ? "bg-purple-700 hover:bg-purple-600 text-purple-100" 
                      : "bg-purple-200 hover:bg-purple-300 text-purple-800"
                  }`}
                >
                  Teste 2022
                </button>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                * Valores de exemplo apenas para demonstração
              </p>
            </div>
          </div>
          
          <p className={`text-xs mt-3 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            💡 <strong>Clique em qualquer mês</strong> para selecioná-lo automaticamente. 
            <strong>Verde</strong> = valores preenchidos, <strong>Laranja</strong> = aguardando valores.
          </p>
        </section>

        {/* Histórico */}
        {showHistory && (
          <section className={`rounded-2xl p-4 shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Histórico de Cálculos</h2>
              <button
                onClick={() => setHistory([])}
                className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                Limpar
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Nenhum cálculo realizado ainda.
                </p>
              ) : (
                history.map((calc) => (
                  <div
                    key={calc.id}
                    className={`p-3 rounded-lg border text-sm ${
                      darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div><strong>Data:</strong> {calc.date}</div>
                      <div><strong>Admissão:</strong> {calc.admission}</div>
                      <div><strong>Salário:</strong> {brl(calc.salary)}</div>
                      <div><strong>Reajuste:</strong> {brl(calc.reajuste)}</div>
                      {calc.retroativeMonths > 0 && (
                        <>
                          <div><strong>Retroativo:</strong> {calc.retroativeMonths} meses</div>
                          <div><strong>Total Retroativo:</strong> {brl(calc.valorRetroativo || 0)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Upload CSV */}
        <section className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className="text-lg font-medium mb-3">🏢 Cálculo em Massa (Várias Pessoas)</h2>
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Como calcular várias pessoas de uma vez:
            </h3>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Baixe o exemplo CSV clicando no botão abaixo</li>
              <li>2. Edite o arquivo com os dados dos funcionários</li>
              <li>3. Faça upload do arquivo preenchido</li>
              <li>4. Veja todos os resultados na tabela</li>
            </ol>
            
            <div className={`mt-3 p-3 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className={`text-xs font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                📋 <strong>Formato do CSV:</strong>
              </p>
              <code className={`text-xs ${darkMode ? "text-green-400" : "text-green-700"}`}>
                salario,admissao<br/>
                5000,2025-02<br/>
                10000,2024-12<br/>
                20000,2025-01
              </code>
              <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                • <strong>salario</strong>: valor numérico (ex: 5000)<br/>
                • <strong>admissao</strong>: formato AAAA-MM (ex: 2025-02)
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <label className={`flex flex-col text-sm ${
                darkMode ? "text-gray-300" : "text-slate-600"
              }`}>
                <span>📋 Upload de planilha CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </label>
              <p className={`text-xs mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <strong>Formato obrigatório:</strong> salario,admissao
              </p>
              <p className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <strong>Exemplo:</strong> 5000,2025-02
              </p>
            </div>
            <button
              onClick={downloadExampleCSV}
              className={`px-4 py-2 rounded-xl shadow transition-colors ${
                darkMode 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              📥 Baixar Exemplo CSV
            </button>
          </div>
          
          {csvData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">📊 Resultados ({csvData.length} funcionários):</h3>
                <button
                  onClick={() => setCsvData([])}
                  className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  Limpar
                </button>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left ${
                      darkMode ? "bg-gray-700" : "bg-slate-100"
                    }`}>
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">Salário Atual</th>
                      <th className="p-2 border">Admissão</th>
                      <th className="p-2 border">Reajuste Mensal</th>
                      <th className="p-2 border">Novo Salário</th>
                      <th className="p-2 border">Retroativo ({retroativeMonths}m)</th>
                      <th className="p-2 border">Regra Aplicada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, idx) => {
                      const sal = parseFloat(row.salario);
                      const { reajuste: reajCSV, regraAplicada: regraCSV, valorRetroativo: retroCSV } = calculateCSVReajuste(row.salario, row.admissao);
                      return (
                        <tr key={idx} className={`${
                          darkMode 
                            ? "odd:bg-gray-800 even:bg-gray-700" 
                            : "odd:bg-white even:bg-slate-50"
                        }`}>
                          <td className="p-2 border font-mono">{idx + 1}</td>
                          <td className="p-2 border">{brl(sal)}</td>
                          <td className="p-2 border">{monthLabel(row.admissao)}</td>
                          <td className="p-2 border font-semibold text-blue-600">{brl(reajCSV)}</td>
                          <td className="p-2 border font-semibold">{brl(sal + reajCSV)}</td>
                          <td className="p-2 border font-semibold text-green-600">{brl(retroCSV)}</td>
                          <td className="p-2 border text-xs">{regraCSV}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h4 className="font-medium mb-2">📈 Resumo Geral:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Funcionários:</span>
                    <div className="font-semibold">{csvData.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Reajustes Mensais:</span>
                    <div className="font-semibold text-blue-600">
                      {brl(csvData.reduce((acc, row) => {
                        const { reajuste } = calculateCSVReajuste(row.salario, row.admissao);
                        return acc + reajuste;
                      }, 0))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Retroativos ({retroativeMonths}m):</span>
                    <div className="font-semibold text-green-600">
                      {brl(csvData.reduce((acc, row) => {
                        const { valorRetroativo } = calculateCSVReajuste(row.salario, row.admissao);
                        return acc + valorRetroativo;
                      }, 0))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Folha Nova Total:</span>
                    <div className="font-semibold">
                      {brl(csvData.reduce((acc, row) => {
                        const sal = parseFloat(row.salario);
                        const { reajuste } = calculateCSVReajuste(row.salario, row.admissao);
                        return acc + sal + reajuste;
                      }, 0))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Parâmetros */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-2xl p-4 shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className="text-lg font-medium mb-3">Parâmetros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Data-base do dissídio</span>
                <input
                  type="month"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={baseDate}
                  onChange={(e) => setBaseDate(monthKey(e.target.value))}
                />
              </label>
              <label className="flex flex-col">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Mês/Ano de admissão</span>
                <input
                  type="month"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={admission}
                  min="2024-08"
                  max="2025-07"
                  onChange={(e) => setAdmission(monthKey(e.target.value))}
                />
                <span className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Período disponível: Ago/2024 a Jul/2025
                </span>
              </label>
              <label className="flex flex-col md:col-span-2">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Salário atual</span>
                <input
                  type="number"
                  step="0.01"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value || "0"))}
                />
              </label>
              <label className="flex flex-col">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Meses retroativos</span>
                <input
                  type="number"
                  min="0"
                  max="12"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={retroativeMonths}
                  onChange={(e) => setRetroativeMonths(parseInt(e.target.value || "0"))}
                />
                <span className={`text-xs mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Quantos meses de retroativo pagar
                </span>
              </label>
            </div>
          </div>

          <div className={`rounded-2xl p-4 shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}>
            <h2 className="text-lg font-medium mb-3">Limites por Faixa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Cap 1 (≤)</span>
                <input
                  type="number"
                  step="0.01"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={cap1}
                  onChange={(e) => setCap1(parseFloat(e.target.value || "0"))}
                />
              </label>
              <label className="flex flex-col">
                <span className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-slate-600"
                }`}>Cap 2 (≤)</span>
                <input
                  type="number"
                  step="0.01"
                  className={`border px-3 py-2 rounded-lg ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300"
                  }`}
                  value={cap2}
                  onChange={(e) => setCap2(parseFloat(e.target.value || "0"))}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                className={`px-3 py-2 rounded-xl shadow transition-colors ${
                  darkMode 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                onClick={exportJSON}
              >
                Exportar tabela (.json)
              </button>
              <label className={`px-3 py-2 rounded-xl shadow cursor-pointer transition-colors ${
                darkMode 
                  ? "bg-gray-700 border border-gray-600 text-white hover:bg-gray-600" 
                  : "bg-slate-100 border hover:bg-slate-200"
              }`}>
                Importar tabela
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={importJSON}
                />
              </label>
            </div>
          </div>
        </section>

        {/* Resultado */}
        <section id="calculation-result" className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg font-medium">Resultado do Cálculo</h2>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={saveToHistory}
                disabled={salary <= 0}
                className={`px-3 py-2 rounded-xl shadow transition-colors text-sm ${
                  salary <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : darkMode 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                💾 Salvar
              </button>
              <button
                onClick={generatePDF}
                disabled={salary <= 0}
                className={`px-3 py-2 rounded-xl shadow transition-colors text-sm ${
                  salary <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : darkMode 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                📄 PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Admissão</div>
              <div className="font-medium">{monthLabel(admission) || "—"}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Data-base</div>
              <div className="font-medium">{monthLabel(baseDate) || "—"}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Regra aplicada</div>
              <div className="font-medium text-xs">{regraAplicada || "—"}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>% proporcional (Faixa 1)</div>
              <div className="font-medium">{pct(percent1)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Salário atual</div>
              <div className="text-lg font-semibold">{brl(salary)}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Valor do reajuste (mensal)</div>
              <div className="text-lg font-semibold">{brl(reajuste)}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-gray-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-gray-400" : "text-slate-500"
              }`}>Novo salário</div>
              <div className="text-lg font-semibold">{brl(novoSalario)}</div>
            </div>
            <div className={`p-3 rounded-xl border ${
              darkMode ? "bg-orange-700 border-orange-600" : "bg-orange-50 border-orange-200"
            }`}>
              <div className={`text-xs ${
                darkMode ? "text-orange-300" : "text-orange-600"
              }`}>Meses retroativos</div>
              <div className="text-lg font-semibold">{retroativeMonths} meses</div>
            </div>
          </div>

          {/* Nova seção para mostrar o retroativo */}
          {retroativeMonths > 0 && (
            <div className={`mt-4 p-4 rounded-xl border-2 ${
              darkMode ? "bg-green-900/30 border-green-600" : "bg-green-50 border-green-400"
            }`}>
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                darkMode ? "text-green-300" : "text-green-700"
              }`}>
                💰 Cálculo do Retroativo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${
                  darkMode ? "bg-green-800/50" : "bg-white"
                }`}>
                  <div className={`text-xs ${
                    darkMode ? "text-green-200" : "text-green-600"
                  }`}>Reajuste mensal</div>
                  <div className="text-lg font-semibold">{brl(reajuste)}</div>
                </div>
                <div className={`p-3 rounded-lg ${
                  darkMode ? "bg-green-800/50" : "bg-white"
                }`}>
                  <div className={`text-xs ${
                    darkMode ? "text-green-200" : "text-green-600"
                  }`}>× {retroativeMonths} meses</div>
                  <div className="text-sm font-medium">{brl(reajuste)} × {retroativeMonths}</div>
                </div>
                <div className={`p-3 rounded-lg ${
                  darkMode ? "bg-green-800/50" : "bg-white"
                }`}>
                  <div className={`text-xs ${
                    darkMode ? "text-green-200" : "text-green-600"
                  }`}>Total retroativo</div>
                  <div className="text-xl font-bold text-green-600">{brl(valorRetroativo)}</div>
                </div>
              </div>
              
              {/* Resumo do que pagar */}
              <div className={`mt-4 p-3 rounded-lg ${
                darkMode ? "bg-gray-800 border border-gray-600" : "bg-gray-100 border border-gray-300"
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}>📋 Resumo dos Valores a Pagar:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Retroativo ({retroativeMonths} meses):</span>
                    <span className="font-bold text-green-600">{brl(valorRetroativo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Novo salário mensal (a partir de agora):</span>
                    <span className="font-bold">{brl(novoSalario)}</span>
                  </div>
                  <hr className={`my-2 ${darkMode ? "border-gray-600" : "border-gray-300"}`} />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total do retroativo:</span>
                    <span className="text-green-600">{brl(totalAPagar)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Seção para Editar Anos Anteriores */}
        <section className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className="text-lg font-medium mb-3">✏️ Editar Anos Anteriores</h2>
          <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Preencha os valores dos anos anteriores quando encontrar as tabelas oficiais SEAAC.
          </p>

          {["2023-2024", "2022-2023"].map((periodo) => {
            const [anoInicial, anoFinal] = periodo.split("-");
            
            // Filtro correto por período acadêmico (agosto a julho)
            const mesesPeriodo = rows.filter(row => {
              const [ano, mes] = row.key.split("-");
              const anoNum = parseInt(ano);
              const mesNum = parseInt(mes);
              
              if (periodo === "2023-2024") {
                return (anoNum === 2023 && mesNum >= 8) || (anoNum === 2024 && mesNum <= 7);
              } else if (periodo === "2022-2023") {
                return (anoNum === 2022 && mesNum >= 8) || (anoNum === 2023 && mesNum <= 7);
              }
              return false;
            });

            const temValores = mesesPeriodo.some(row => row.p1 > 0);

            return (
              <div key={periodo} className={`mb-6 p-4 rounded-lg border-2 ${
                temValores 
                  ? darkMode ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
                  : darkMode ? "border-orange-600 bg-orange-900/20" : "border-orange-200 bg-orange-50"
              }`}>
                <h3 className={`text-md font-medium mb-3 flex items-center gap-2 ${
                  temValores 
                    ? darkMode ? "text-green-400" : "text-green-700"
                    : darkMode ? "text-orange-400" : "text-orange-700"
                }`}>
                  {temValores ? "✅" : "📝"} 
                  Período {periodo}
                </h3>

                <div className="grid gap-3">
                  {mesesPeriodo.map((row, idx) => {
                    const rowIndex = rows.findIndex(r => r.key === row.key);
                    return (
                      <div key={row.key} className={`p-3 rounded-md ${
                        darkMode ? "bg-gray-700" : "bg-white"
                      } border ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                          <div className="font-medium">
                            {monthLabel(row.key)}
                          </div>
                          
                          <div>
                            <label className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              Faixa 1 (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={row.p1 || ""}
                              onChange={(e) => updateRow(rowIndex, "p1", parseFloat(e.target.value || "0"))}
                              className={`w-full border px-2 py-1 rounded text-sm ${
                                darkMode 
                                  ? "bg-gray-600 border-gray-500 text-white" 
                                  : "bg-white border-gray-300"
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div>
                            <label className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              Faixa 2 (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={row.p2 || ""}
                              onChange={(e) => updateRow(rowIndex, "p2", parseFloat(e.target.value || "0"))}
                              className={`w-full border px-2 py-1 rounded text-sm ${
                                darkMode 
                                  ? "bg-gray-600 border-gray-500 text-white" 
                                  : "bg-white border-gray-300"
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div>
                            <label className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              Faixa 2 (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.fixa2 || ""}
                              onChange={(e) => updateRow(rowIndex, "fixa2", parseFloat(e.target.value || "0"))}
                              className={`w-full border px-2 py-1 rounded text-sm ${
                                darkMode 
                                  ? "bg-gray-600 border-gray-500 text-white" 
                                  : "bg-white border-gray-300"
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div>
                            <label className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              Faixa 3 (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.fixo3 || ""}
                              onChange={(e) => updateRow(rowIndex, "fixo3", parseFloat(e.target.value || "0"))}
                              className={`w-full border px-2 py-1 rounded text-sm ${
                                darkMode 
                                  ? "bg-gray-600 border-gray-500 text-white" 
                                  : "bg-white border-gray-300"
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`mt-3 p-2 rounded-md ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                  <p className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    💡 <strong>Dica:</strong> Encontre os valores oficiais no site do SEAAC em "Acordos Coletivos" → "Tabela de Reajustes {periodo}"
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Tabela Completa (Visão Avançada) */}
        <section className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
            <h2 className="text-lg font-medium">Tabela Proporcional por Mês de Admissão</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={resetToDefault}
                className={`px-3 py-2 rounded-xl shadow transition-colors ${
                  darkMode 
                    ? "bg-orange-600 text-white hover:bg-orange-700" 
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
                title="Resetar para valores padrão (2024-2025 preenchidos)"
              >
                🔄 Resetar Padrão
              </button>
              <button
                onClick={addRow}
                className={`px-3 py-2 rounded-xl shadow transition-colors ${
                  darkMode 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                + Adicionar mês
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${
                  darkMode ? "bg-gray-700" : "bg-slate-100"
                }`}>
                  <th className="p-2 border">Mês/Ano de admissão</th>
                  <th className="p-2 border">% até Cap 1</th>
                  <th className="p-2 border">% entre Cap 1 e Cap 2</th>
                  <th className="p-2 border">Parcela fixa (Faixa 2)</th>
                  <th className="p-2 border">Valor fixo (acima Cap 2)</th>
                  <th className="p-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.key} className={`${
                    darkMode 
                      ? "odd:bg-gray-800 even:bg-gray-700" 
                      : "odd:bg-white even:bg-slate-50"
                  }`}>
                    <td className="p-2 border whitespace-nowrap">
                      <input
                        type="month"
                        className={`border px-2 py-1 rounded ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                        value={r.key}
                        onChange={(e) => updateRow(idx, "key", monthKey(e.target.value))}
                      />
                      <div className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-slate-500"
                      }`}>{monthLabel(r.key)}</div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={r.p1}
                          onChange={(e) => updateRow(idx, "p1", parseFloat(e.target.value || "0"))}
                          className={`w-full border px-2 py-1 rounded ${
                            darkMode 
                              ? "bg-gray-600 border-gray-500 text-white" 
                              : "bg-white border-gray-300"
                          }`}
                        />
                        <span className={darkMode ? "text-gray-400" : "text-slate-500"}>%</span>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={r.p2}
                          onChange={(e) => updateRow(idx, "p2", parseFloat(e.target.value || "0"))}
                          className={`w-full border px-2 py-1 rounded ${
                            darkMode 
                              ? "bg-gray-600 border-gray-500 text-white" 
                              : "bg-white border-gray-300"
                          }`}
                        />
                        <span className={darkMode ? "text-gray-400" : "text-slate-500"}>%</span>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={r.fixa2}
                        onChange={(e) => updateRow(idx, "fixa2", parseFloat(e.target.value || "0"))}
                        className={`w-full border px-2 py-1 rounded ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={r.fixo3}
                        onChange={(e) => updateRow(idx, "fixo3", parseFloat(e.target.value || "0"))}
                        className={`w-full border px-2 py-1 rounded ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 text-white" 
                            : "bg-white border-gray-300"
                        }`}
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => removeRow(idx)}
                        className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                        title="Remover linha"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={`text-xs mt-2 ${
            darkMode ? "text-gray-400" : "text-slate-500"
          }`}>
            <strong>📅 Período da tabela oficial SEAAC:</strong> Agosto/2024 a Julho/2025 (12 meses).
            <br />
            <strong>Exemplo:</strong> <span className="font-medium">Fev/2025 = 3,07% (Faixa 1), 2,69% + R$ 30,59 (Faixa 2), R$ 469,46 (Faixa 3)</span>.
            <br />
            <strong>💡 Dica:</strong> Para outros períodos, adicione novas linhas com o botão "+ Adicionar mês".
          </p>
        </section>

        <footer className={`text-xs pb-6 ${
          darkMode ? "text-gray-400" : "text-slate-500"
        }`}>
          App local-first (salva a tabela no navegador). Exporte/importe o JSON para compartilhar.
        </footer>
      </div>
    </div>
  );
}