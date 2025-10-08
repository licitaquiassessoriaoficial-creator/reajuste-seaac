import React, { useEffect, useState } from "react";

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
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Calculadora de Reajuste Proporcional (SEAAC)
          </h1>
          <p className="text-slate-600 max-w-3xl">
            Preencha a tabela de percentuais/parcela fixa por mês de admissão (proporcional),
            defina os limites salariais por faixa e informe o salário. O sistema aplica
            automaticamente a regra: <span className="font-medium">até Cap 1 → %</span>;{" "}
            <span className="font-medium">entre Cap 1 e Cap 2 → % + parcela fixa</span>;{" "}
            <span className="font-medium">acima Cap 2 → valor fixo</span>.
          </p>
        </header>

        {/* Mensagens de feedback */}
        {message.text && (
          <div className={`rounded-2xl p-4 shadow-lg border-l-4 ${
            message.type === "success" 
              ? "bg-green-50 border-green-400 text-green-800" 
              : "bg-red-50 border-red-400 text-red-800"
          }`}>
            <div className="flex items-center">
              <span className="font-medium">
                {message.type === "success" ? "✅ Sucesso: " : "❌ Erro: "}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Parâmetros */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="text-lg font-medium mb-3">Parâmetros</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-slate-600">Data-base do dissídio</span>
                <input
                  type="month"
                  className="border px-3 py-2 rounded-lg"
                  value={baseDate}
                  onChange={(e) => setBaseDate(monthKey(e.target.value))}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-slate-600">Mês/Ano de admissão</span>
                <input
                  type="month"
                  className="border px-3 py-2 rounded-lg"
                  value={admission}
                  onChange={(e) => setAdmission(monthKey(e.target.value))}
                />
              </label>
              <label className="flex flex-col col-span-2">
                <span className="text-sm text-slate-600">Salário atual</span>
                <input
                  type="number"
                  step="0.01"
                  className="border px-3 py-2 rounded-lg"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value || "0"))}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow">
            <h2 className="text-lg font-medium mb-3">Limites por Faixa</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-slate-600">Cap 1 (≤)</span>
                <input
                  type="number"
                  step="0.01"
                  className="border px-3 py-2 rounded-lg"
                  value={cap1}
                  onChange={(e) => setCap1(parseFloat(e.target.value || "0"))}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-slate-600">Cap 2 (≤)</span>
                <input
                  type="number"
                  step="0.01"
                  className="border px-3 py-2 rounded-lg"
                  value={cap2}
                  onChange={(e) => setCap2(parseFloat(e.target.value || "0"))}
                />
              </label>
            </div>
            <div className="flex gap-3 mt-4 items-center">
              <button
                className="px-3 py-2 rounded-xl bg-slate-900 text-white shadow"
                onClick={exportJSON}
              >
                Exportar tabela (.json)
              </button>
              <label className="px-3 py-2 rounded-xl bg-slate-100 border shadow cursor-pointer">
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
        <section className="rounded-2xl bg-white p-4 shadow">
          <h2 className="text-lg font-medium mb-4">Resultado do Cálculo</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Admissão</div>
              <div className="font-medium">{monthLabel(admission) || "—"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Data-base</div>
              <div className="font-medium">{monthLabel(baseDate) || "—"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Regra aplicada</div>
              <div className="font-medium">{regraAplicada || "—"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">% proporcional (Faixa 1)</div>
              <div className="font-medium">{pct(percent1)}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Salário atual</div>
              <div className="text-lg font-semibold">{brl(salary)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Valor do reajuste</div>
              <div className="text-lg font-semibold">{brl(reajuste)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border">
              <div className="text-xs text-slate-500">Novo salário</div>
              <div className="text-lg font-semibold">{brl(novoSalario)}</div>
            </div>
          </div>
        </section>

        {/* Tabela */}
        <section className="rounded-2xl bg-white p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Tabela Proporcional por Mês de Admissão</h2>
            <button
              onClick={addRow}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white shadow"
            >
              + Adicionar mês
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
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
                  <tr key={r.key} className="odd:bg-white even:bg-slate-50">
                    <td className="p-2 border whitespace-nowrap">
                      <input
                        type="month"
                        className="border px-2 py-1 rounded"
                        value={r.key}
                        onChange={(e) => updateRow(idx, "key", monthKey(e.target.value))}
                      />
                      <div className="text-xs text-slate-500">{monthLabel(r.key)}</div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={r.p1}
                          onChange={(e) => updateRow(idx, "p1", parseFloat(e.target.value || "0"))}
                          className="w-full border px-2 py-1 rounded"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={r.p2}
                          onChange={(e) => updateRow(idx, "p2", parseFloat(e.target.value || "0"))}
                          className="w-full border px-2 py-1 rounded"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={r.fixa2}
                        onChange={(e) => updateRow(idx, "fixa2", parseFloat(e.target.value || "0"))}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        step="0.01"
                        value={r.fixo3}
                        onChange={(e) => updateRow(idx, "fixo3", parseFloat(e.target.value || "0"))}
                        className="w-full border px-2 py-1 rounded"
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

          <p className="text-xs text-slate-500 mt-2">
            Dados já preenchidos com a tabela oficial do SEAAC. 
            Exemplo: <span className="font-medium">Fev/2025 = 3,07% (Faixa 1), 2,69% + R$ 30,59 (Faixa 2), R$ 469,46 (Faixa 3)</span>.
          </p>
        </section>

        <footer className="text-xs text-slate-500 pb-6">
          App local-first (salva a tabela no navegador). Exporte/importe o JSON para compartilhar.
        </footer>
      </div>
    </div>
  );
}