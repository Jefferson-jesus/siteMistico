<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function env_or_null(string $key): ?string {
    $value = getenv($key);
    if ($value === false || $value === '') {
        return null;
    }
    return $value;
}

function load_local_config(): array {
    $path = __DIR__ . '/reviews.config.php';
    if (is_file($path)) {
        $config = include $path;
        if (is_array($config)) {
            return $config;
        }
    }
    return [];
}

function query_string(string $key, string $default = ''): string {
    $value = $_GET[$key] ?? $default;
    return is_string($value) ? trim($value) : $default;
}

function clamp_int(string $key, int $default, int $min, int $max): int {
    $raw = $_GET[$key] ?? $default;
    $intVal = filter_var($raw, FILTER_VALIDATE_INT);
    if ($intVal === false) {
        return $default;
    }
    return max($min, min($max, $intVal));
}

$config = load_local_config();

$apiKey = env_or_null('GOOGLE_PLACES_API_KEY')
    ?? ($config['api_key'] ?? null);

$defaultPlaceId = env_or_null('GOOGLE_PLACE_ID')
    ?? ($config['place_id'] ?? '');

$placeId = query_string('placeId', (string)$defaultPlaceId);
$languageCode = query_string('languageCode', 'pt-BR');
$minStars = clamp_int('minStars', 4, 1, 5);
$maxReviews = clamp_int('maxReviews', 5, 1, 10);

if (!$apiKey || !$placeId) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing server configuration',
        'hint' => 'Configure GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID (or reviews.config.php).'
    ]);
    exit;
}

$url = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId)
    . '?languageCode=' . rawurlencode($languageCode);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        'X-Goog-Api-Key: ' . $apiKey,
        'X-Goog-FieldMask: rating,userRatingCount,reviews'
    ],
]);

$responseBody = curl_exec($ch);
$curlErrNo = curl_errno($ch);
$curlErrMsg = curl_error($ch);
$statusCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($curlErrNo !== 0) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to reach Google Places API', 'details' => $curlErrMsg]);
    exit;
}

if ($statusCode < 200 || $statusCode >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'Google Places API returned an error', 'status' => $statusCode]);
    exit;
}

$payload = json_decode((string)$responseBody, true);
if (!is_array($payload)) {
    http_response_code(502);
    echo json_encode(['error' => 'Invalid JSON from Google Places API']);
    exit;
}

$reviews = $payload['reviews'] ?? [];
if (!is_array($reviews)) {
    $reviews = [];
}

$filtered = [];
foreach ($reviews as $review) {
    if (!is_array($review)) {
        continue;
    }
    $rating = (int)($review['rating'] ?? 0);
    $text = '';
    if (isset($review['text']) && is_array($review['text'])) {
        $text = (string)($review['text']['text'] ?? '');
    }
    if ($rating < $minStars || $text === '') {
        continue;
    }
    $filtered[] = [
        'rating' => $rating,
        'text' => $text,
    ];
    if (count($filtered) >= $maxReviews) {
        break;
    }
}

echo json_encode([
    'rating' => (float)($payload['rating'] ?? 0),
    'userRatingCount' => (int)($payload['userRatingCount'] ?? 0),
    'reviews' => $filtered
], JSON_UNESCAPED_UNICODE);
