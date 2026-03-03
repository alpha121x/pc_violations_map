<?php

$url = $_GET['url'] ?? '';

if (!$url) {
    http_response_code(400);
    exit("No URL provided");
}

// Validate URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit("Invalid URL");
}

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

// 🔥 VERY IMPORTANT: set user agent
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');

// If HTTP only
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$data = curl_exec($ch);

if ($data === false) {
    http_response_code(500);
    echo "cURL Error: " . curl_error($ch);
    curl_close($ch);
    exit;
}

$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($httpCode != 200) {
    http_response_code($httpCode);
    exit("Remote server returned HTTP $httpCode");
}

// CORS
header("Access-Control-Allow-Origin: *");

// Set correct content type
header("Content-Type: " . ($contentType ?: "image/jpeg"));
header("Cache-Control: public, max-age=86400");

echo $data;