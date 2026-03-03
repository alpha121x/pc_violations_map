<?php
$url = $_GET['url'] ?? '';
if (!$url) exit;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
header("Content-Type: $contentType");
echo $data;