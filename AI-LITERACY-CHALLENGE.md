# 🎓 DR.DE.SOUZ.AI — AI Literacy Challenge

> Um jogo interativo de quiz para aprender IA em 3 níveis progressivos, criado por [DrDeSouzAI](https://github.com/mrdesouzaphd-cmyk).

🌐 **[▶ Jogar agora](https://mrdesouzaphd-cmyk.github.io/claude-code/)**

---

## 📖 Sobre o projeto

O **AI Literacy Challenge** é um jogo de quiz bilíngue (PT-BR) que ensina conceitos de Inteligência Artificial em três níveis:

| Nível | Nome | Tópicos |
|---|---|---|
| 🟢 1 | Fundação (Literacy) | O que é IA, GenAI vs Preditiva, Redes Neurais, Modelos Multimodais |
| 🟡 2 | Competência (Skills) | Prompt Science, Hallucination, Tokens, RAG, Context Window, AI Agents |
| 🔴 3 | Maestria (Science) | Chain of Thought, Temperature, Epistemic Agency, 2 Sigma, Reasoning Models |

Criado com **Claude Code** (Claude Opus 4.5 + Anthropic) como exemplo de agente de IA em ação.

---

## ⚠️ Requisito de API — Placar Global

O jogo funciona **completamente** sem nenhuma configuração adicional — você pode jogar, responder perguntas e ver seus resultados imediatamente.

No entanto, o **placar global (leaderboard)** requer uma API de armazenamento para salvar e comparar as pontuações entre os jogadores. Sem ela, o placar aparece vazio e as pontuações não são persistidas.

### Como funciona a API

O jogo usa `window.storage` — um objeto da **Cloudflare Workers KV** que deve ser injetado por um Worker de borda. Quando não está disponível (como em uma implantação estática no GitHub Pages), o jogo exibe um aviso de "Modo offline".

### Configuração do backend (Cloudflare Workers KV)

Para ativar o placar global:

1. **Crie uma conta Cloudflare** em [cloudflare.com](https://cloudflare.com) (gratuito).

2. **Crie um KV Namespace** no painel Cloudflare > Workers & Pages > KV:
   ```
   Nome sugerido: ai-literacy-leaderboard
   ```

3. **Crie um Worker** que injete o KV como `window.storage` e sirva o `index.html`:
   ```js
   export default {
     async fetch(request, env) {
       // Injeta o binding KV na resposta HTML
       const html = await env.ASSETS.fetch(request);
       // Configure o binding KV como window.storage via middleware
       return html;
     }
   }
   ```

4. **Configure o binding** no `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "storage"
   id = "SEU_KV_NAMESPACE_ID"
   ```

5. **Aponte o domínio personalizado** para o Worker para que `window.storage` seja disponibilizado automaticamente.

> 💡 **Alternativa simples:** Você pode substituir `window.storage` por qualquer API REST ou banco de dados de sua preferência — basta implementar os métodos `get(key)`, `set(key, value)` e `list(prefix)`.

---

## 🚀 Uso sem API (modo standalone)

O jogo funciona 100% offline/standalone. Basta abrir o `index.html` em qualquer navegador:

```bash
# Clonar e abrir localmente
git clone https://github.com/mrdesouzaphd-cmyk/claude-code.git
cd claude-code
git checkout gh-pages
open index.html  # ou double-click no arquivo
```

O progresso local é salvo automaticamente via `localStorage` do navegador.

---

## 🏗️ Tecnologias

- **HTML/CSS/JS** puro — sem frameworks, sem dependências
- **Cloudflare Workers KV** — para o placar global (opcional)
- **GitHub Pages** — hospedagem estática gratuita
- Criado por **Claude Code** (Claude Opus 4.5 · Anthropic)

---

## 📝 Licença

Este projeto é de uso educacional livre. Conteúdo criado por DrDeSouzAI — Pesquisador em IA · Educador · PhD · Harvard GSE.

© 2026 [DR.DE.SOUZ.AI](https://github.com/mrdesouzaphd-cmyk)
