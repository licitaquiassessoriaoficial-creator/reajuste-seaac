# 📊 Manual de Uso - Calculadora de Reajuste Proporcional SEAAC

## 🎯 O que é esta calculadora?

A **Calculadora de Reajuste Proporcional SEAAC** é uma ferramenta online que calcula automaticamente o reajuste salarial proporcional conforme a convenção coletiva do SEAAC, considerando o mês de admissão do funcionário.

**🌐 Acesse em:** <https://calculadora-reajuste.netlify.app/>

---

## 🚀 Como usar - Guia Rápido

### **1️⃣ Cálculo Individual**

1. **Informe o salário atual** do funcionário
2. **Selecione o mês/ano de admissão** (clique diretamente na tabela ou use o campo)
3. **Veja o resultado** automaticamente:
   - Percentual aplicado
   - Novo salário
   - Valor do aumento
   - Regra aplicada (Faixa 1, 2 ou 3)

### **2️⃣ Cálculo em Massa (Várias Pessoas)**

1. **Baixe o exemplo CSV** clicando em "📥 Baixar Exemplo CSV"
2. **Edite o arquivo** com os dados dos funcionários:
   ```csv
   salario,admissao
   5000,2025-02
   10000,2024-12
   20000,2025-01
   ```
3. **Faça upload** do arquivo preenchido
4. **Veja todos os resultados** na tabela gerada

---

## 📅 Como Funciona o Reajuste SEAAC

### **🔢 Sistema de 3 Faixas Salariais**

| Faixa | Salário | Cálculo |
|-------|---------|---------|
| **Faixa 1** | Até R$ 8.157,41 | Percentual sobre salário |
| **Faixa 2** | R$ 8.157,41 a R$ 16.314,42 | Percentual + Parcela Fixa |
| **Faixa 3** | Acima de R$ 16.314,42 | Valor Fixo |

### **📆 Período Proporcional**

- **Data-base:** Agosto de cada ano
- **Reajuste proporcional:** Calculado do mês de admissão até julho do ano seguinte
- **Exemplo:** Admitido em fevereiro/2025 = direito a reajuste de fevereiro a julho (3,07%)

---

## 🛠️ Funcionalidades Disponíveis

### **📊 Visualização da Tabela**
- **Verde:** Períodos com valores preenchidos (2024-2025)
- **Laranja:** Períodos aguardando valores (anos anteriores)
- **Clique em qualquer mês** para seleção automática

### **✏️ Edição de Anos Anteriores**
- Seção dedicada para preencher valores de anos anteriores
- Campos organizados por período acadêmico
- Salvamento automático no navegador

### **🎨 Personalização**
- **Tema claro/escuro** automático
- **Interface responsiva** (funciona em celular e computador)
- **Modo de impressão** otimizado

### **📋 Ferramentas Úteis**
- **Histórico** de cálculos realizados
- **Busca** no histórico
- **Export PDF** dos resultados
- **Limpar** histórico quando necessário

---

## 📖 Exemplos Práticos

### **Exemplo 1: Faixa 1 (Salário Baixo)**
- **Salário:** R$ 5.000,00
- **Admissão:** Fevereiro/2025
- **Resultado:** R$ 5.000,00 × 3,07% = R$ 5.153,50

### **Exemplo 2: Faixa 2 (Salário Médio)**
- **Salário:** R$ 10.000,00
- **Admissão:** Dezembro/2024
- **Resultado:** R$ 10.000,00 × 3,59% + R$ 40,78 = R$ 10.399,78

### **Exemplo 3: Faixa 3 (Salário Alto)**
- **Salário:** R$ 20.000,00
- **Admissão:** Janeiro/2025
- **Resultado:** R$ 20.000,00 + R$ 547,70 = R$ 20.547,70

---

## 🔧 Dicas de Uso

### **💡 Para RH e Gestores**

1. **Use o cálculo em massa** para processar folhas completas
2. **Salve o histórico** para auditorias futuras
3. **Exporte PDFs** para documentação oficial
4. **Mantenha backup** dos arquivos CSV utilizados

### **⚠️ Atenções Importantes**

- **Verifique sempre** o mês de admissão correto
- **Salários acima do teto** têm valor fixo, não percentual
- **Data-base é agosto** - admissões após julho do ano seguinte não têm direito
- **Use vírgula ou ponto** para decimais nos CSVs

### **🆘 Resolução de Problemas**

**Tabela aparece zerada?**
- Clique em "🔄 Resetar Padrão" na seção de tabela

**CSV não carrega?**
- Verifique se tem exatamente 2 colunas: `salario,admissao`
- Use formato de data: `AAAA-MM` (ex: 2025-02)

**Cálculo parece errado?**
- Confirme se o mês de admissão está correto
- Verifique se o salário está na faixa esperada

---

## 📞 Suporte e Contato

### **🌐 Links Úteis**

- **Calculadora:** <https://calculadora-reajuste.netlify.app/>
- **Site SEAAC:** <seaac.com.br>
- **Convenções Coletivas:** Consulte no site oficial do SEAAC

### **📝 Informações Técnicas**
- **Atualizada:** Outubro 2025
- **Tabela:** 2024-2025 (Oficial SEAAC)
- **Compatibilidade:** Todos navegadores modernos
- **Responsiva:** Desktop, tablet e mobile

---

## 🎉 Vantagens da Ferramenta

✅ **Gratuita** e online
✅ **Cálculos automáticos** e precisos
✅ **Interface moderna** e intuitiva
✅ **Cálculo em massa** para eficiência
✅ **Histórico** e documentação
✅ **Sempre atualizada** com tabelas oficiais
✅ **Funciona offline** após primeiro acesso

---

*📌 **Nota:** Esta calculadora segue rigorosamente as tabelas oficiais do SEAAC. Em caso de dúvidas sobre a convenção coletiva, consulte sempre os documentos oficiais.*

**Desenvolvido com ❤️ para facilitar os cálculos de RH**