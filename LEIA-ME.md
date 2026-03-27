# 📦 Rota do Lucro — PWA

## Estrutura de arquivos

```
pasta-do-app/
├── index.html            ← App completo (v3 + PWA integrado)
├── manifest.json         ← Configuração do PWA
├── service-worker.js     ← Cache offline e atualização automática
└── icons/
    ├── icon-192.png      ← Ícone Android / Chrome (192×192)
    ├── icon-512.png      ← Ícone splash screen / Play Store (512×512)
    └── apple-touch-icon.png  ← Ícone iOS Safari (180×180)
```

---

## 🚀 Como publicar

### Opção 1 — Hospedagem gratuita (recomendado)

**Netlify Drop** (mais fácil, sem conta necessária):
1. Acesse https://app.netlify.com/drop
2. Arraste a **pasta inteira** para a área indicada
3. O site ficará online em segundos com HTTPS ✅

**GitHub Pages**:
1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em Settings → Pages → Source: main / root
4. Acesse via `https://seunome.github.io/nome-do-repo`

> ⚠️ PWA **exige HTTPS**. Localhost funciona para testes,
> mas para instalar no celular o site precisa estar em HTTPS.

---

## 📱 Como instalar no celular

### Android (Chrome)
Após abrir o site, o banner de instalação aparece automaticamente.
Se não aparecer:
1. Toque nos **3 pontos** ⋮ no canto superior direito
2. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**

### iPhone / iPad (Safari)
1. Abra o site no **Safari** (não funciona no Chrome do iOS)
2. Toque no ícone **Compartilhar** ⬆️ na barra inferior
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme tocando em **Adicionar**

---

## 🔄 Como atualizar o app

Quando você publicar uma nova versão do `index.html`:

1. Abra o arquivo `service-worker.js`
2. Altere a linha no topo:
   ```js
   const CACHE_VERSION = 'rota-lucro-v1';
   //                                  ↑ mude para v2, v3, etc.
   ```
3. Faça o deploy novamente

O app mostrará automaticamente uma barra **"Nova versão disponível!"**
para os usuários. Ao clicar em **Atualizar agora**, o app recarrega com a versão nova.

---

## 🧪 Testar offline

1. Abra o app no Chrome
2. DevTools (F12) → aba **Application** → Service Workers
3. Marque **"Offline"**
4. Recarregue a página — deve funcionar normalmente ✅

---

## 📝 O que foi adicionado ao index.html

### No `<head>`:
```html
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="RotaLucro">
```

### No final do `<body>` (antes de `</div><!-- /app -->`):
- Banner de instalação (`#pwa-install-banner`)
- Barra de update disponível (`#pwa-update-bar`)

### No JavaScript (final do `<script>`):
- Registro do Service Worker
- Captura do evento `beforeinstallprompt`
- Lógica de instalação e atualização automática
- Instruções manuais para iOS

---

## ✅ Checklist de PWA

- [x] manifest.json com ícones 192 e 512
- [x] Service Worker com cache offline
- [x] HTTPS (ao publicar em Netlify/GitHub Pages)
- [x] Funciona offline após primeira visita
- [x] Banner de instalação automático (Android/Chrome)
- [x] Instruções manuais para iOS Safari
- [x] Atualização automática ao detectar nova versão
- [x] Dados salvos no localStorage (não são perdidos offline)
