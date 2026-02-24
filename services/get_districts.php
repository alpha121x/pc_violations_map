<?php
include "./db_config.php";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $sql = "
        SELECT 
            gid         AS district_id,
            district_n AS district_name,
            div_name   AS division_name
        FROM public.punjab_district_boundary
        ORDER BY district_n ASC
    ";

    $districts = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "districts" => $districts
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}

exit;