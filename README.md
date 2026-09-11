# AI Hub Workstation

Uma workstation desktop moderna e minimalista para gerenciar, alternar e turbinar fluxos de trabalho com múltiplas Inteligências Artificiais simultaneamente no Windows.

Projetada com estética monocromática profunda (*Obsidian / Raycast style*), ergonomia visual aprimorada, zero dependência de abas pesadas do navegador e controle inteligente de limites e cotas.

---

## ✨ Recursos Principais

- **Studio Nativo Ultra Rápido**:
  - Chat nativo em React sem a sobrecarga de navegadores web (consome ~70MB de RAM).
  - Integração direta com a API do **Google Gemini 2.0 Flash** (streaming em tempo real).
  - Conexão nativa com **Ollama Local** (`127.0.0.1:11434`) para executar modelos 100% offline e privados (Llama 3, DeepSeek R1, Qwen).

- **Sessões Isoladas de Contas Web**:
  - Webviews embarcados com partições independentes de cookies e sessões (`persist:id`).
  - Mantenha ChatGPT Plus, Claude, Gemini, Perplexity e DeepSeek conectados simultaneamente sem deslogar.

- **Dock Lateral Flutuante (Estilo Resvori)**:
  - Docker retrátil e minimalista para monitorar o status e o consumo de cota das suas IAs em tempo real enquanto você trabalha no VS Code ou navega no Windows.
  - Indicadores néon de ciclo e recuperação de cota.

- **Modo Multi-Grid & Comparador de Respostas**:
  - Visualize e consulte até 4 IAs ao mesmo tempo em tela dividida.
  - Broadcaster de prompt sincronizado: digite uma dúvida e envie para múltiplos modelos simultaneamente.
  - Laboratório de comparação lado a lado (*Side-by-Side Diff*) com métricas de palavras, caracteres e contagem estimada de tokens.

- **Ferramentas Integradas para Desenvolvedores**:
  - **Prompt Engineering Studio**: Otimizador inteligente que transforma ideias brutas em prompts estruturados de alta fidelidade com técnicas anti-alucinação.
  - **Biblioteca de Prompts & Templates**: Coleção de templates dinâmicos com variáveis `{{variavel}}` preenchíveis.
  - **Central de Personas & Especialistas**: 12+ papéis sênior pré-configurados (Arquiteto de Software, Pentester OWASP, SRE, Tech Lead).
  - **Sandbox de Código & Live Preview**: Execute e visualize protótipos de HTML/CSS/JS gerados pela IA em sandbox seguro isolado.
  - **Calculadora de Tokens & Estimativa de Custos**: Compare custos de entrada/saída em USD e BRL entre modelos de ponta.
  - **Scratchpad com Voz**: Bloco de notas rápido com suporte a ditado por voz, conversão texto-para-fala (TTS) e salvamento local.

- **Privacidade & Zero Lock-in**:
  - Backup completo em 1 clique exportável em formato universal JSON.
  - Exportação das notas do Scratchpad diretamente em Markdown limpo (`.md`).
  - Modo Stealth (Camuflagem): oculta nomes, fotos e informações sensíveis durante chamadas de vídeo ou compartilhamento de tela.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- Gerenciador de pacotes npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Jeffersonf/ai-hub-workstation.git

# Acesse a pasta do projeto
cd ai-hub-workstation

# Instale as dependências
npm install
```

### Executando em Modo Desktop (Electron + Vite)

```bash
npm start
```
*Ou execute pelo script `iniciar.bat` no Windows.*

### Compilando para Produção

```bash
npm run build
```

---

## ⌨️ Atalhos Úteis

| Atalho | Ação |
| :--- | :--- |
| `Ctrl + K` | Abrir Command Palette (Busca Global) |
| `Ctrl + 1..9` | Alternar entre contas de IA |
| `Ctrl + Tab` | Próxima IA |
| `Ctrl + M` | Alternar Modo Mini / Docker |
| `Ctrl + Shift + S` | Ativar Modo Camuflagem (Stealth) |
| `Ctrl + Alt + Space` | Atalho Global no Windows para invocar a Workstation |

---

## 📄 Licença

Distribuído sob a licença MIT.
