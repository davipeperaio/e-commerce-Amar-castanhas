
  # E-commerce de Castanhas

  This is a code bundle for E-commerce de Castanhas. The original project is available at https://www.figma.com/design/yD0E6FlcK5NbvhUXkJitvh/E-commerce-de-Castanhas.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
## Amar Castanhas — Loja e Dashboard

Projeto React + Vite com vitrine pública (loja) e painel administrativo (produtos, margens, gastos, clientes e vendas).

### Pré‑requisitos
- Node.js 18+ e npm

### Instalação
```
npm install
```

### Rodar em desenvolvimento
```
npm run dev
```

### Build de produção
```
npm run build
npm run preview
```

### Estrutura
- `public/` — assets estáticos (logo etc.)
- `src/components/` — componentes de UI (loja, dashboard, etc.)
- `src/lib/` — tipos, utilitários e dados mock

### Publicar no GitHub
1. Inicialize o repositório:
```
git init
git add -A
git commit -m "chore: initial import"
```
2. Crie o repositório remoto no GitHub e conecte:
```
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### CI (opcional)
Um workflow de CI (Node) está em `.github/workflows/ci.yml` para instalar dependências e executar build.
