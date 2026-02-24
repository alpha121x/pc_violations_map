<?php
include "./db_config.php";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // ← add if frontend is on different domain

// ────────────────────────────────────────────────
if (!isset($_GET['district_id']) || !is_numeric($_GET['district_id'])) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "district_id is required and must be a number"
    ]);
    exit;
}

$district_id = (int)$_GET['district_id'];

try {
    $sql = "
        SELECT 
            gid,
            district_id,
            district_n          AS district_name,
            div_name            AS division_name,
            bridges_count,
            culvert_count,
            underpass_count,
            zone,
            ST_AsGeoJSON(geom)  AS geometry,
            ST_XMin(geom)       AS bbox_xmin,
            ST_YMin(geom)       AS bbox_ymin,
            ST_XMax(geom)       AS bbox_xmax,
            ST_YMax(geom)       AS bbox_ymax
        FROM public.punjab_district_boundary
        WHERE district_id = :district_id
        LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute(['district_id' => $district_id]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode([
            "status"  => "error",
            "message" => "District not found"
        ]);
        exit;
    }

    // Build clean GeoJSON Feature
    $feature = [
        "type"       => "Feature",
        "id"         => $row['gid'],
        "geometry"   => json_decode($row['geometry'], true), // already GeoJSON string → object
        "properties" => [
            "gid"            => $row['gid'],
            "district_id"    => $row['district_id'],
            "district_name"  => $row['district_name'],
            "division_name"  => $row['division_name'],
            "bridges_count"  => (int)$row['bridges_count'],
            "culvert_count"  => (int)$row['culvert_count'],
            "underpass_count"=> (int)$row['underpass_count'],
            "zone"           => $row['zone'],
            "bbox"           => [
                "xmin" => (float)$row['bbox_xmin'],
                "ymin" => (float)$row['bbox_ymin'],
                "xmax" => (float)$row['bbox_xmax'],
                "ymax" => (float)$row['bbox_ymax']
            ]
        ]
    ];

    echo json_encode([
        "status"  => "success",
        "data"    => $feature
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database error",
        "debug"   => $e->getMessage()   // ← remove in production!
    ]);
}