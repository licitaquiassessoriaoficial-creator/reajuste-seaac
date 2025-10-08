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
const defaultRows = [
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

export default function App() {
  // principais
  const [salary, setSalary] = useState(0);
  const [admission, setAdmission] = useState("2025-02");
  const [baseDate, setBaseDate] = useState("2025-08");

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
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultRows;
  });

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

  if (salary <= cap1) {
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
        baseDate: monthLabel(baseDate)
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
    if (!entryCSV) return { reajuste: 0, regraAplicada: "Mês não encontrado" };

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

    return { reajuste: reaj, regraAplicada: regra };
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
          <h2 className="text-lg font-medium mb-3">Cálculo em Massa (CSV)</h2>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <label className={`flex flex-col text-sm ${
                darkMode ? "text-gray-300" : "text-slate-600"
              }`}>
                <span>Upload de planilha CSV (colunas: salario, admissao)</span>
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
                Formato: salario,admissao (ex: 10000,2025-02)
              </p>
            </div>
          </div>
          
          {csvData.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Resultados do CSV ({csvData.length} registros):</h3>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left ${
                      darkMode ? "bg-gray-700" : "bg-slate-100"
                    }`}>
                      <th className="p-2 border">Salário</th>
                      <th className="p-2 border">Admissão</th>
                      <th className="p-2 border">Reajuste</th>
                      <th className="p-2 border">Novo Salário</th>
                      <th className="p-2 border">Regra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, idx) => {
                      const sal = parseFloat(row.salario);
                      const { reajuste: reajCSV, regraAplicada: regraCSV } = calculateCSVReajuste(row.salario, row.admissao);
                      return (
                        <tr key={idx} className={`${
                          darkMode 
                            ? "odd:bg-gray-800 even:bg-gray-700" 
                            : "odd:bg-white even:bg-slate-50"
                        }`}>
                          <td className="p-2 border">{brl(sal)}</td>
                          <td className="p-2 border">{monthLabel(row.admissao)}</td>
                          <td className="p-2 border">{brl(reajCSV)}</td>
                          <td className="p-2 border">{brl(sal + reajCSV)}</td>
                          <td className="p-2 border text-xs">{regraCSV}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                  onChange={(e) => setAdmission(monthKey(e.target.value))}
                />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
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
              }`}>Valor do reajuste</div>
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
          </div>
        </section>

        {/* Tabela */}
        <section className={`rounded-2xl p-4 shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
            <h2 className="text-lg font-medium">Tabela Proporcional por Mês de Admissão</h2>
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
            Dados já preenchidos com a tabela oficial do SEAAC. 
            Exemplo: <span className="font-medium">Fev/2025 = 3,07% (Faixa 1), 2,69% + R$ 30,59 (Faixa 2), R$ 469,46 (Faixa 3)</span>.
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