<?php
declare(strict_types=1);

// Simple image proxy to avoid browser mixed-content blocking on HTTPS pages.
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=300');

$rawUrl = $_GET['url'] ?? '';
if ($rawUrl === '') {
    http_response_code(400);
    echo 'Missing url parameter.';
    exit;
}

$decodedUrl = urldecode($rawUrl);
$parts = parse_url($decodedUrl);

if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
    http_response_code(400);
    echo 'Invalid URL.';
    exit;
}

$scheme = strtolower($parts['scheme']);
$host = strtolower($parts['host']);
$port = isset($parts['port']) ? (int) $parts['port'] : null;

// Tight allow-list to reduce SSRF risk.
$allowedHost = 'content2.urbanunit.gov.pk';
$allowedPort = 8083;
if ($scheme !== 'http' || $host !== $allowedHost || $port !== $allowedPort) {
    http_response_code(403);
    echo 'URL not allowed.';
    exit;
}

$ch = curl_init($decodedUrl);
if ($ch === false) {
    http_response_code(500);
    echo 'Failed to initialize proxy request.';
    exit;
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 2,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Accept: image/*,*/*;q=0.8'],
]);

$body = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$err = curl_error($ch);
curl_close($ch);

if ($body === false || $status < 200 || $status >= 300) {
    http_response_code(502);
    echo 'Failed to fetch image.';
    if ($err !== '') {
        error_log('image_proxy error: ' . $err);
    }
    exit;
}

if ($contentType === '' || stripos($contentType, 'image/') !== 0) {
    // Keep fallback to octet-stream if upstream omits headers.
    $contentType = 'application/octet-stream';
}

header('Content-Type: ' . $contentType);
echo $body;
