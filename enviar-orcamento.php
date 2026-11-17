<?php
/**
 * VRF 360 — recebe o formulário de orçamento e envia por e-mail.
 *
 * Requisitos: PHP 7.4+ com a função mail() habilitada (padrão na maioria das hospedagens).
 * Ajuste as constantes abaixo depois de publicar o site.
 */
declare(strict_types=1);

/* ===================== CONFIGURAÇÃO ===================== */
const DESTINO         = 'irwing.rich@outlook.com';      // quem recebe os pedidos
const REMETENTE       = 'irwing@vrf360.com.br';           // use um endereço do próprio domínio
const NOME_REMETENTE  = 'Site VRF 360';
const ASSUNTO         = 'Pedido de orçamento — site VRF 360';
const LIMITE_POR_HORA = 5;                              // envios por IP a cada hora
const USAR_ENVELOPE   = true;                           // envia com "-f REMETENTE" (melhora a entrega)
/* ======================================================== */

date_default_timezone_set('America/Sao_Paulo');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

if (!function_exists('mb_substr')) {
    function mb_substr($s, $start, $len = null, $enc = null) { return $len === null ? substr($s, $start) : substr($s, $start, $len); }
    function mb_strlen($s, $enc = null) { return strlen($s); }
}

$querJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function responder(bool $ok, string $mensagem, int $status = 200): void
{
    global $querJson;
    http_response_code($status);
    if ($querJson) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok, 'message' => $mensagem], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($ok) {
        header('Location: obrigado.html', true, 303);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $m = htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>Não foi possível enviar — VRF 360</title></head>'
        . '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:12vh auto;padding:0 20px;line-height:1.6;color:#16191b">'
        . '<h1 style="font-weight:400">Não foi possível enviar o pedido</h1><p>' . $m . '</p>'
        . '<p>Você também pode falar com a gente pelo <a href="https://wa.me/5511945191038">WhatsApp (11) 94519-1038</a> '
        . 'ou pelo e-mail <a href="mailto:irwing.rich@outlook.com">irwing.rich@outlook.com</a>.</p>'
        . '<p><a href="/#orcamento">← Voltar ao formulário</a></p></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(false, 'Método não permitido.', 405);
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    responder(false, 'A mensagem é muito longa.', 413);
}

/** Lê um campo de texto, remove caracteres de controle e limita o tamanho. */
function campo(string $nome, int $max): string
{
    $v = $_POST[$nome] ?? '';
    if (!is_string($v)) return '';
    $v = str_replace("\0", '', $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return trim(mb_substr($v, 0, $max, 'UTF-8'));
}
/** Remove quebras de linha (protege cabeçalhos de e-mail). */
function linha(string $v): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

/* ---- Anti-spam 1: campo-isca (robôs costumam preencher) ---- */
if (campo('website', 200) !== '') {
    responder(true, 'Pedido recebido.');
}

/* ---- Anti-spam 2: armadilha de tempo (o navegador registra quando a página abriu) ---- */
$agora = time();
$t = campo('t', 20);
if ($t !== '') {
    if (!ctype_digit($t)) responder(false, 'Requisição inválida.', 400);
    $decorrido = $agora - (int)$t;
    if ($decorrido < 3) responder(false, 'Envio muito rápido. Aguarde alguns segundos e tente novamente.', 429);
    if ($decorrido > 6 * 3600) responder(false, 'O formulário expirou. Recarregue a página e tente novamente.', 400);
}

/* ---- Anti-spam 3: limite de envios por IP ---- */
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$arquivoLimite = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'vrf360_' . hash('sha256', $ip . '|vrf360') . '.json';
$historico = [];
if (is_file($arquivoLimite)) {
    $historico = json_decode((string)@file_get_contents($arquivoLimite), true);
    if (!is_array($historico)) $historico = [];
}
$historico = array_values(array_filter($historico, function ($ts) use ($agora) { return is_int($ts) && $ts > $agora - 3600; }));
if (count($historico) >= LIMITE_POR_HORA) {
    responder(false, 'Muitos envios em pouco tempo. Tente novamente mais tarde ou fale pelo WhatsApp.', 429);
}

/* ---- Dados ---- */
$nome       = linha(campo('nome', 100));
$empresa    = linha(campo('empresa', 120));
$email      = linha(campo('email', 160));
$telefone   = linha(campo('telefone', 30));
$cidade     = linha(campo('cidade', 80));
$edificacao = linha(campo('edificacao', 60));
$area       = linha(campo('area', 40));
$prazo      = linha(campo('prazo', 40));
$mensagem   = campo('mensagem', 2000);

$servicosValidos = ['Projetos', 'Supervisão', 'Comissionamento', 'Fotografia técnica', 'Análise energética', 'Consultoria'];
$servicos = [];
if (isset($_POST['servicos']) && is_array($_POST['servicos'])) {
    foreach ($_POST['servicos'] as $s) {
        if (is_string($s) && in_array($s, $servicosValidos, true)) $servicos[] = $s;
    }
}

/* ---- Validação ---- */
$erros = [];
if (mb_strlen($nome, 'UTF-8') < 2) $erros[] = 'nome';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $erros[] = 'e-mail';
$digitos = preg_replace('/\D/', '', $telefone) ?? '';
if (strlen($digitos) < 10) $erros[] = 'telefone';
if (mb_strlen($mensagem, 'UTF-8') < 10) $erros[] = 'mensagem';
if ($erros) responder(false, 'Verifique: ' . implode(', ', $erros) . '.', 422);

/* Sem JavaScript não há armadilha de tempo: recusa mensagens com muitos links */
if ($t === '' && preg_match_all('~https?://~i', $mensagem) > 1) {
    responder(false, 'Mensagem não aceita. Fale com a gente pelo WhatsApp.', 422);
}

/* ---- Monta o e-mail ---- */
$h = function (string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); };
$dados = [
    'Nome'            => $nome,
    'Empresa'         => $empresa,
    'E-mail'          => $email,
    'Telefone'        => $telefone,
    'Cidade/UF'       => $cidade,
    'Serviços'        => implode(', ', $servicos),
    'Edificação'      => $edificacao,
    'Área aproximada' => $area,
    'Prazo'           => $prazo,
];
$quando = date('d/m/Y') . ' às ' . date('H:i');

$texto = "Novo pedido de orçamento pelo site VRF 360\n\n";
foreach ($dados as $rotulo => $valor) {
    if ($valor !== '') $texto .= $rotulo . ': ' . $valor . "\n";
}
$texto .= "\nMensagem:\n" . $mensagem . "\n\n— Enviado em " . $quando . "\n";

$wa = (strpos($digitos, '55') === 0 && strlen($digitos) > 11) ? $digitos : '55' . $digitos;
$linhasHtml = '';
foreach ($dados as $rotulo => $valor) {
    if ($valor === '') continue;
    $linhasHtml .= '<tr><td style="padding:9px 0;border-bottom:1px solid #eceeed;width:36%;color:#565c60;font-size:13px;vertical-align:top">' . $h($rotulo) . '</td>'
        . '<td style="padding:9px 0;border-bottom:1px solid #eceeed;font-size:15px">' . $h($valor) . '</td></tr>';
}
$html = '<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f5f4;font-family:Arial,Helvetica,sans-serif;color:#16191b">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f4;padding:24px 12px"><tr><td align="center">'
    . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden">'
    . '<tr><td style="background:#141618;padding:22px 28px;color:#ffffff;font-size:18px">Novo pedido de orçamento <span style="color:#00b191">· VRF 360</span></td></tr>'
    . '<tr><td style="padding:24px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $linhasHtml . '</table>'
    . '<p style="margin:22px 0 6px;color:#565c60;font-size:13px">Mensagem</p>'
    . '<div style="font-size:15px;line-height:1.6">' . nl2br($h($mensagem)) . '</div>'
    . '<p style="margin:26px 0 0"><a href="mailto:' . $h($email) . '" style="display:inline-block;background:#00b191;color:#04241e;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Responder por e-mail</a>'
    . '&nbsp;&nbsp;<a href="https://wa.me/' . $h($wa) . '" style="color:#00866f;font-size:14px">Abrir conversa no WhatsApp</a></p>'
    . '</td></tr><tr><td style="padding:16px 28px;background:#f3f5f4;color:#8a9094;font-size:12px">Enviado pelo formulário de vrf360.com.br em ' . $h($quando) . '.</td></tr>'
    . '</table></td></tr></table></body></html>';

$fronteira = 'vrf360-' . bin2hex(random_bytes(12));
$b64 = function (string $s): string { return '=?UTF-8?B?' . base64_encode($s) . '?='; };
$cabecalhos = [
    'From: ' . $b64(NOME_REMETENTE) . ' <' . REMETENTE . '>',
    'Reply-To: ' . $b64($nome) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $fronteira . '"',
    'X-Mailer: VRF360-Site',
];
$corpo = '--' . $fronteira . "\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($texto)) . "\r\n"
    . '--' . $fronteira . "\r\n"
    . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($html)) . "\r\n"
    . '--' . $fronteira . "--\r\n";

$parametros = USAR_ENVELOPE ? '-f' . REMETENTE : '';
$enviado = @mail(DESTINO, $b64(ASSUNTO . ' — ' . $nome), $corpo, implode("\r\n", $cabecalhos), $parametros);
if (!$enviado && USAR_ENVELOPE) {
    // Algumas hospedagens não aceitam o parâmetro -f: tenta sem ele
    $enviado = @mail(DESTINO, $b64(ASSUNTO . ' — ' . $nome), $corpo, implode("\r\n", $cabecalhos));
}
if (!$enviado) {
    responder(false, 'O servidor de e-mail não respondeu.', 500);
}

$historico[] = $agora;
@file_put_contents($arquivoLimite, json_encode($historico), LOCK_EX);
responder(true, 'Pedido enviado com sucesso.');
