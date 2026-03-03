<?php
$url = $_GET['url'] ?? '';
if (!$url) {
    http_response_code(400);
    exit("No URL provided");
}

// 🔒 Optional: basic security check (recommended)
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit("Invalid URL");
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // if remote is HTTP
$data = curl_exec($ch);

if ($data === false) {
    http_response_code(500);
    exit("Image fetch failed");
}

$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// ✅ CORS header
header("Access-Control-Allow-Origin: *");

// ✅ Correct content type
header("Content-Type: " . ($contentType ?: "image/jpeg"));

// Optional caching (recommended)
header("Cache-Control: public, max-age=86400");

echo $data;