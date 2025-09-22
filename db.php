<?php
// Database configuration
$host = 'localhost';        // Your MySQL host
$dbname = 'shami_nanola'; // Your database name
$username = 'shami_nanola'; // Your MySQL username
$password = 'SkipHire@8182'; // Your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>