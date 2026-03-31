# Tata Roxiluanda - Site Institucional

Landing page estática focada em SEO técnico/local, performance e conversão para WhatsApp.

## Tecnologias
- HTML5
- CSS3
- JavaScript (vanilla)
- PHP (opcional, apenas para integração de avaliações Google)

## Estrutura do projeto
- `index.html`: página principal
- `styles.css`: estilos do site
- `script.js`: interações (animação, slider, fallback de imagem, galeria, reviews)
- `404.html`: página de erro customizada
- `assets/`: imagens e ícones
- `api/reviews.php`: endpoint opcional para avaliações Google
- `structured-data/`: JSON-LD para SEO
- `robots.txt`: diretrizes para crawlers
- `sitemap.xml`: mapa do site
- `manifest.webmanifest`: metadata web app

## Como o site funciona
- Hero com CTA principal para WhatsApp.
- Seções de serviços, processo de atendimento, sobre, depoimentos, FAQ e contato local.
- Botão flutuante de WhatsApp para conversão contínua.
- SEO técnico aplicado no `head` (`title`, `description`, canonical, OG, Twitter).
- SEO local com endereço, telefone clicável e localização em São Paulo.
- Dados estruturados via JSON-LD (serviço + FAQ).

## Executar localmente

### Opção 1 (rápida): servidor estático
No diretório do projeto:

```powershell
python -m http.server 5500
```

Acesse:
- `http://localhost:5500`

### Opção 2 (recomendada se for testar reviews PHP)
No diretório do projeto:

```powershell
php -S localhost:5500
```

Acesse:
- `http://localhost:5500`

## Ativar avaliações do Google (opcional)
1. Copie o arquivo de exemplo:

```powershell
Copy-Item api/reviews.config.example.php api/reviews.config.php
```

2. Edite `api/reviews.config.php` e preencha:
- `api_key`
- `place_id`

3. No `script.js`, altere:
- `GOOGLE_REVIEWS_CONFIG.enabled` para `true`

## Deploy
Esse projeto pode ser publicado como site estático (Hostinger, Netlify, Vercel estático, etc.).

Checklist de deploy:
- Subir todos os arquivos mantendo estrutura de pastas
- Confirmar `index.html` como página inicial
- Confirmar `robots.txt` e `sitemap.xml` na raiz
- Validar URLs finais no Search Console

## Manutenção rápida
- Conteúdo principal: `index.html`
- Estilo/layout: `styles.css`
- Comportamentos: `script.js`
- SEO estruturado: `structured-data/*.jsonld`

## Observações
- Preserve nomes de classes existentes para evitar quebra de layout.
- Se usar minificação em hospedagem, valide o resultado final após publicar.
- Em caso de cache agressivo, limpe cache/CDN após cada alteração.
