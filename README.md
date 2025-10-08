# 📊 Calculadora de Reajuste Proporcional (SEAAC)

Uma aplicação web moderna para calcular reajustes proporcionais por mês/ano de admissão conforme as regras do SEAAC (Sindicato dos Empregados em Empresas de Assessoramento, Perícias, Informações e Pesquisas e de Seleção e Treinamento de Recursos Humanos no Estado de São Paulo).

## 🚀 Funcionalidades

### 📋 **Cálculo Automático por Faixas**
- **Faixa 1** (≤ R$ 8.157,41): Aplica percentual sobre o salário
- **Faixa 2** (R$ 8.157,41 a R$ 16.314,42): Aplica percentual + parcela fixa
- **Faixa 3** (> R$ 16.314,42): Aplica valor fixo

### 🗓️ **Tabela Proporcional Completa**
- 12 meses pré-configurados (Ago/2024 a Jul/2025)
- Dados oficiais do SEAAC já preenchidos
- Edição em tempo real dos percentuais e valores
- Validação para evitar meses duplicados

### 💾 **Persistência Local**
- Salva automaticamente no localStorage do navegador
- Exportação em formato JSON
- Importação de configurações salvas
- Mensagens de feedback para todas as operações

### 🎨 **Interface Moderna**
- Design responsivo com Tailwind CSS
- Cards com cantos arredondados e sombras suaves
- Formatação brasileira de moeda (R$)
- Feedback visual com mensagens de sucesso/erro

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 3
- **Build**: Vite (ESM, HMR)
- **Deploy**: Netlify (CI/CD automático)

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd reajuste-seaac

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy

### Netlify (Recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. O arquivo `netlify.toml` já está configurado para SPA

### Manual
```bash
npm run build
# Upload da pasta 'dist/' para seu servidor
```

## 📊 Como Usar

1. **Configure os Parâmetros**:
   - Data-base do dissídio (padrão: Ago/2025)
   - Mês/ano de admissão do colaborador
   - Salário atual
   - Limites das faixas (Cap 1 e Cap 2)

2. **Consulte a Tabela**:
   - A tabela já vem com os valores oficiais do SEAAC
   - Edite os percentuais se necessário
   - Adicione novos meses com o botão "+ Adicionar mês"

3. **Visualize o Resultado**:
   - O cálculo é automático ao digitar
   - Mostra qual regra foi aplicada
   - Exibe o valor do reajuste e novo salário

4. **Salve/Compartilhe**:
   - Export: Baixa arquivo JSON com a configuração
   - Import: Carrega configuração salva

## 💡 Exemplo Prático

**Colaborador admitido em Fev/2025 com salário de R$ 10.000,00:**

- **Regra aplicada**: Faixa 2 (entre R$ 8.157,41 e R$ 16.314,42)
- **Cálculo**: 2,69% de R$ 10.000,00 + R$ 30,59 = R$ 299,59
- **Novo salário**: R$ 10.299,59

## 📋 Estrutura do Projeto

```
reajuste-seaac/
├── public/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Ponto de entrada
│   └── index.css        # Estilos Tailwind
├── index.html           # Template HTML
├── package.json         # Dependências
├── vite.config.js       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
├── postcss.config.js    # Configuração PostCSS
├── netlify.toml         # Configuração Netlify
└── README.md           # Documentação
```

## 🔧 Configuração

### Limites Padrão
- **Cap 1**: R$ 8.157,41
- **Cap 2**: R$ 16.314,42

### Dados Oficiais SEAAC (Ago/2024 - Jul/2025)
| Mês | Faixa 1 | Faixa 2 | Parcela Fixa | Valor Fixo |
|-----|---------|---------|--------------|------------|
| Ago/2024 | 6,13% | 5,38% | R$ 61,17 | R$ 938,91 |
| Fev/2025 | 3,07% | 2,69% | R$ 30,59 | R$ 469,46 |
| Jul/2025 | 0,51% | 0,45% | R$ 5,10 | R$ 78,24 |

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, abra uma [issue](link-para-issues) no GitHub.

---

Desenvolvido com ❤️ para facilitar os cálculos de reajuste do SEAAC.