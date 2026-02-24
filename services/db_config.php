<?php

// $host = "172.20.82.84";
// $db   = "price_control_punjab";
// $user = "postgres";
// $pass = "diamondx";
// $port = "5432";


// $host = "localhost";
// $db   = "db_cnw_rams";
// $user = "postgres";
// $pass = "diamondx";
// $port = "5432";


try {
    $conn = new PDO(
        "pgsql:host=$host;port=$port;dbname=$db",
        $user,
        $pass
    );

    // Enable error mode (VERY IMPORTANT)
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // echo "Database connection successful!";

} catch(PDOException $e){
    die("Database connection failed: " . $e->getMessage());
}
?>