<?php

$url = $_GET['url'] ?? '';

if (!$url) {
    http_response_code(400);
    exit("No URL provided");
}

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit("Invalid URL");
}

// Temporary filename
$tmpFile = sys_get_temp_dir() . '/' . uniqid('img_');

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$data = curl_exec($ch);

if ($data === false) {
    http_response_code(500);
    exit("Download failed: " . curl_error($ch));
}

$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// Save temporarily
file_put_contents($tmpFile, $data);

// Output headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: " . ($contentType ?: "image/jpeg"));
header("Content-Length: " . filesize($tmpFile));

// Output file
readfile($tmpFile);

// Delete immediately
unlink($tmpFile);