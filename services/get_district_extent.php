<?php
include "./db_config.php";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  // change to your domain in production

if (!isset($_GET['district_id']) || !is_numeric($_GET['district_id'])) {
    http_response_code(400);
    echo json_encode([
        "error" => "district_id is required and must be a number"
    ]);
    exit;
}

$district_id = (int)$_GET['district_id'];

try {
    $sql = "
        SELECT 
            gid,
            district_n          AS district_name,
            ST_XMin(geom)       AS xmin,
            ST_YMin(geom)       AS ymin,
            ST_XMax(geom)       AS xmax,
            ST_YMax(geom)       AS ymax
        FROM public.punjab_district_boundary
        WHERE district_id = :district_id
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute(['district_id' => $district_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["error" => "District not found"]);
        exit;
    }

    // very simple flat response — perfect for map.fitBounds()
    echo json_encode([
        "gid"           => (int)$row['gid'],
        "district_name" => $row['district_name'],
        "bounds" => [
            [$row['ymin'], $row['xmin']],   // southwest [lat, lng]
            [$row['ymax'], $row['xmax']]    // northeast [lat, lng]
        ]
    ], JSON_NUMERIC_CHECK);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error"]);
}

exit;