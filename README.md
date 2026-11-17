# Site VRF 360 — versão 2.0

Site institucional one-page da VRF 360 Engenharia Térmica, em HTML, CSS e JavaScript puros (sem etapa de build).

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Página principal (todo o conteúdo, SEO e dados estruturados) |
| `politica.html` | Política de Privacidade |
| `obrigado.html` | Página de confirmação do orçamento (usada só quando o navegador está sem JavaScript) |
| `404.html` | Página de erro "não encontrada" |
| `enviar-orcamento.php` | Recebe o formulário de orçamento e envia por e-mail |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | Arquivos de SEO e de ícones |
| `.htaccess` | HTTPS, cache, compressão e página 404 (Apache/LiteSpeed) |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` | Ícones do site |
| `assets/css/main.css` | Todo o visual do site |
| `assets/js/` | Animações e interações (um arquivo por seção) |
| `assets/vendor/` | Bibliotecas: GSAP 3.15 (ScrollTrigger, SplitText) e Lenis 1.3 |
| `assets/fonts/` | Fontes Jost e JetBrains Mono (hospedadas no próprio site) |
| `assets/seq/` | Quadros da animação da condensadora (desktop e celular) |
| `assets/img/` | Logos, fotos otimizadas (AVIF/WebP/JPG), ícones e imagem de compartilhamento |

## Como publicar

1. Envie **todo o conteúdo desta pasta** para a pasta pública da hospedagem (normalmente `public_html`), substituindo o `index.html` antigo.
   - **Não envie** a pasta `.claude/` nem este `README.md` (são só para desenvolvimento).
   - O `.htaccess` é um arquivo oculto: confira se ele foi enviado.
2. Os arquivos antigos (`style.css`, `script.js`, `hero.png`, `ufpe.jpg`, `tjrr.jpg`, `mackenzie.png`, `irwing.jpg`, `logo.png`, `vrf360_logo_ass.gif` etc.) podem ser apagados depois de conferir que o novo site está no ar. A `politica.html` antiga deve ser substituída pela nova.

## Configurar o envio do formulário

Abra `enviar-orcamento.php` e confira o bloco **CONFIGURAÇÃO** no topo:

- `DESTINO`: e-mail que recebe os pedidos (hoje `irwing.rich@outlook.com`).
- `REMETENTE`: endereço que aparece como remetente. Use um e-mail **do próprio domínio** (ex.: `site@vrf360.com.br`). Isso melhora muito a entrega e evita a caixa de spam. Se possível, crie essa caixa no painel da hospedagem.
- A resposta ao e-mail vai direto para o visitante (cabeçalho *Reply-To*).
- Proteções incluídas: campo-isca, tempo mínimo de preenchimento e limite de 5 envios por IP por hora. Não há CAPTCHA.
- Se o envio falhar, o visitante vê na hora os botões **Enviar pelo WhatsApp** e **Enviar por e-mail**, com a mensagem já montada. Nenhum pedido se perde.

### Teste logo após publicar (importante)

O PHP só pode ser testado na hospedagem:

1. Abra o site, preencha o formulário com dados reais seus e envie.
2. Confira a caixa de entrada **e o spam** de `irwing.rich@outlook.com`.
3. Se o e-mail cair no spam, configure SPF/DKIM do domínio no painel da hospedagem e use um `REMETENTE` do domínio.
4. Se aparecer "O servidor de e-mail não respondeu", a função `mail()` pode estar desativada: peça ao suporte da hospedagem para ativá-la ou para indicar o SMTP.

## SEO depois de publicar

1. **Google Search Console** (search.google.com/search-console): adicione o domínio `vrf360.com.br`, verifique a propriedade e envie o sitemap `https://vrf360.com.br/sitemap.xml`.
2. **Teste de resultados avançados** (search.google.com/test/rich-results): confira os dados estruturados (empresa HVAC, fundador e FAQ).
3. **PageSpeed Insights** (pagespeed.web.dev): meça o desempenho no celular e no desktop.
4. Opcional: crie ou atualize o **Perfil da Empresa no Google** com o mesmo nome, telefone e site.

O que já está pronto no código: título e descrição otimizados, canonical, Open Graph/Twitter (imagem `assets/img/og-vrf360.jpg`), favicons, manifest, JSON-LD (`WebSite`, `WebPage`, `HVACBusiness`, `Person`, `FAQPage`), HTML semântico com um único H1, textos alternativos nas imagens, `robots.txt` e `sitemap.xml`.

## Atualizações comuns

- **Textos**: todos estão no `index.html`. Se mudar perguntas do FAQ, atualize também o bloco `FAQPage` no JSON-LD do `<head>`.
- **Telefone/WhatsApp/e-mail**: buscar e substituir `5511945191038`, `(11) 94519-1038` e `irwing.rich@outlook.com` no `index.html` e no `assets/js/form.js`.
- **Depois de alterar CSS/JS**: troque o número `?v=20261117` nas chamadas do `index.html` para forçar o navegador a baixar a versão nova.
- **Fotos novas no portfólio**: gere versões AVIF/WebP/JPG nas larguras usadas (640, 960 e 1440 px) e uma versão "térmica" para a lente.
- **Página 404**: é autossuficiente (estilos, logo e ícone embutidos no próprio `404.html`), porque o servidor a exibe no lugar de qualquer endereço inexistente, em qualquer profundidade. Se o logo mudar, atualize-o também nela.

## Testar no computador

O módulo de formulário e as animações funcionam melhor servidos por HTTP:

```
python -I .claude/devserver.py --port 5173
```

Depois abra `http://localhost:5173`. Esse servidor de testes simula o PHP. Para testar o caminho de erro, envie o formulário com o nome **erro**.

Abrir os arquivos `.html` direto da pasta (ou pela pré-visualização de arquivos do editor) não mostra o site como ele fica publicado: fontes, formulário e, em algumas pré-visualizações, até estilos e imagens não carregam. Use sempre o servidor local acima ou o site publicado.

Parâmetros de teste: `?reduced=1` (simula "reduzir movimento") e `?nojs=1` (simula navegador sem JavaScript).

## Acessibilidade e desempenho

- Respeita a preferência "reduzir movimento" do sistema: sem preloader, sem rolagem suave e com imagem estática no lugar da animação.
- Sem JavaScript, todo o conteúdo continua visível e o formulário envia normalmente.
- Contraste AA, foco visível no teclado, link "Pular para o conteúdo" e menu móvel acessível (Esc fecha).
- A animação da condensadora carrega aos poucos: primeiro quadro imediato e o restante em segundo plano (~3,6 MB no desktop e ~1,1 MB no celular, em AVIF).

## Créditos e licenças

- Foto ilustrativa do card UFPE: Evgeniy Surzhan / Unsplash (licença Unsplash, uso comercial gratuito).
- Animação e vista explodida da condensadora: renders ilustrativos gerados com IA (arquivos da pasta `Ver_1.0/Ref`). O crédito "gerados com IA" aparece no rodapé.
- Fotos do TJRR, do Mackenzie, da cobertura com condensadoras e do fundador: arquivos originais da VRF 360.
- Fontes Jost e JetBrains Mono: SIL Open Font License.
- GSAP (gsap.com, licença padrão gratuita) e Lenis (licença MIT).
