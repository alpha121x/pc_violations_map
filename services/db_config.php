<?php

<<<<<<< HEAD
// $host = "localhost";
// $port = "5433";
// $dbname = "db_cnw_rams";   // make sure this database exists
// $user = "postgres";
// $password = "1234";        // use the SAME password you used in pgAdmin


=======
>>>>>>> parent of 7754b38 (Update db_config.php)
$host = "172.20.82.84";
$db   = "price_control_punjab";
$user = "postgres";
$pass = "diamondx";
$port = "5432";
<<<<<<< HEAD

=======
>>>>>>> parent of 7754b38 (Update db_config.php)

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