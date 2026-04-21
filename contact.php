<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function loadDotEnv(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        if ($key === '') {
            continue;
        }

        $isQuoted = strlen($value) >= 2 && (
            ($value[0] === '"' && substr($value, -1) === '"') ||
            ($value[0] === "'" && substr($value, -1) === "'")
        );

        if ($isQuoted) {
            $value = substr($value, 1, -1);
        }

        $values[$key] = $value;
    }

    return $values;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

if (!empty($payload['_gotcha'] ?? '')) {
    respond(200, ['ok' => true, 'message' => 'Message sent successfully.']);
}

$name = trim((string) ($payload['name'] ?? ''));
$email = trim((string) ($payload['_replyto'] ?? $payload['email'] ?? ''));
$message = trim((string) ($payload['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    respond(422, ['ok' => false, 'error' => 'Name, email, and message are required.']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'Please provide a valid email address.']);
}

$env = loadDotEnv(__DIR__ . '/.env');
$botToken = $env['TELEGRAM_BOT_TOKEN'] ?? getenv('TELEGRAM_BOT_TOKEN') ?: '';
$chatId = $env['TELEGRAM_CHAT_ID'] ?? getenv('TELEGRAM_CHAT_ID') ?: '';

if ($botToken === '' || $chatId === '' ||
    strpos($botToken, 'replace-with') !== false || strpos($chatId, 'replace-with') !== false) {
    respond(500, ['ok' => false, 'error' => 'Telegram bot settings are not configured on the server.']);
}

$host = $_SERVER['HTTP_HOST'] ?? 'unknown-host';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown-ip';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown-user-agent';

$text = implode("\n", [
    'New portfolio contact',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Message: ' . $message,
    '',
    'Host: ' . $host,
    'IP: ' . $ip,
    'User Agent: ' . $userAgent,
]);

$endpoint = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';
$requestBody = json_encode([
    'chat_id' => $chatId,
    'text' => $text,
], JSON_UNESCAPED_SLASHES);

if ($requestBody === false) {
    respond(500, ['ok' => false, 'error' => 'Failed to prepare the Telegram payload.']);
}

$curl = curl_init($endpoint);
if ($curl === false) {
    respond(500, ['ok' => false, 'error' => 'Failed to initialize the Telegram request.']);
}

curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $requestBody,
    CURLOPT_TIMEOUT => 15,
]);

$responseBody = curl_exec($curl);
$statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($responseBody === false || $curlError !== '') {
    respond(502, ['ok' => false, 'error' => 'Unable to reach Telegram right now.']);
}

$telegramResponse = json_decode($responseBody, true);
if ($statusCode >= 400 || !is_array($telegramResponse) || !($telegramResponse['ok'] ?? false)) {
    respond(502, ['ok' => false, 'error' => 'Telegram rejected the message.']);
}

respond(200, ['ok' => true, 'message' => 'Message sent successfully. Thank you for reaching out.']);
