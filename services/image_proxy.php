<?php
declare(strict_types=1);

// Simple image proxy to avoid browser mixed-content blocking on HTTPS pages.
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=300');

$rawUrl = $_GET['url'] ?? '';
$debug = isset($_GET['debug']) && $_GET['debug'] === '1';
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


$resolveRules = [];
$content2Ip = getenv('IMAGE_PROXY_CONTENT2_IP');
if (!is_string($content2Ip) || trim($content2Ip) === '') {
    $content2Ip = '172.20.81.66';
}
if (trim($content2Ip) !== '') {
    $resolveIp = trim($content2Ip);
    $resolvePort = $allowedPort;
    // Allow override in "IP:PORT" format as well.
    if (strpos($resolveIp, ':') !== false) {
        [$ipPart, $portPart] = array_pad(explode(':', $resolveIp, 2), 2, '');
        $resolveIp = trim($ipPart);
        if (ctype_digit(trim($portPart))) {
            $resolvePort = (int) trim($portPart);
        }
    }
    // Optional DNS override for environments where host DNS is broken.
    $resolveRules[] = $allowedHost . ':' . $resolvePort . ':' . $resolveIp;
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Accept: image/*,*/*;q=0.8'],
    CURLOPT_RESOLVE => $resolveRules,
]);

$body = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$effectiveUrl = (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
$errno = curl_errno($ch);
$err = curl_error($ch);
curl_close($ch);

if ($body === false || $status < 200 || $status >= 300) {
    http_response_code(502);
    header('Content-Type: application/json');
    $payload = [
        'error' => 'Failed to fetch image.',
        'upstream_status' => $status,
        'curl_errno' => $errno,
    ];
    if ($debug) {
        $payload['upstream_url'] = $decodedUrl;
        $payload['effective_url'] = $effectiveUrl;
        $payload['curl_error'] = $err;
    }
    error_log(
        'image_proxy fetch failed'
        . ' upstream=' . $decodedUrl
        . ' status=' . $status
        . ' errno=' . $errno
        . ' error=' . $err
    );
    echo json_encode($payload);
    exit;
}

if ($contentType === '' || stripos($contentType, 'image/') !== 0) {
    // Keep fallback to octet-stream if upstream omits headers.
    $contentType = 'application/octet-stream';
}

header('Content-Type: ' . $contentType);
echo $body;
