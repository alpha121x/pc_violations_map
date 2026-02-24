<?php
include "./db_config.php";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $sql = "
        SELECT 
            gid,
            district_name,
            -- add more fields if they exist in this table:
            -- division_name, zone, etc.
            ST_XMin(geom) AS bbox_xmin,
            ST_YMin(geom) AS bbox_ymin,
            ST_XMax(geom) AS bbox_xmax,
            ST_YMax(geom) AS bbox_ymax
        FROM food_security.tbl_districts
        ORDER BY district_name
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $districts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status"    => "success",
        "count"     => count($districts),
        "districts" => $districts
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database error"
    ]);
}

exit;