<?php
// Database configuration that works in both local Docker and production

// Detect if we're running in Docker
$isDocker = getenv('DOCKER_CONTAINER') === 'true' || file_exists('/.dockerenv');

if ($isDocker) {
    // Docker environment - use service name
    $db_host = 'db';
} else {
    // Production environment - use localhost
    $db_host = 'localhost';
}

// Database credentials (same for both environments)
$db_name = 'COP4331';
$db_user = 'TheBeast';
$db_pass = 'WeLoveCOP4331';

// Function to create database connection
function getDBConnection() {
    global $db_host, $db_name, $db_user, $db_pass;
    
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        return false;
    }
    
    // Set charset to match production
    $conn->set_charset("utf8mb4");
    
    return $conn;
}
?>