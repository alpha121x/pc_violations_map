<?php

$host = "localhost";
$port = "5433";
$dbname = "db_cnw_rams";   // make sure this database exists
$user = "postgres";
$password = "1234";        // use the SAME password you used in pgAdmin

try {

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

    $conn = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // echo "Connected successfully";

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}