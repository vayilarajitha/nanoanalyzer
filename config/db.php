<?php
// NanoUptake Analyzer - Supabase Cloud Database Connection Layer
// Direct PostgreSQL Connection via PDO (pdo_pgsql) driven strictly by environment variables

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/supabase_client.php';

// Environment parameters for Supabase PostgreSQL Connection
$db_host = env('SUPABASE_DB_HOST', 'aws-0-us-east-1.pooler.supabase.com');
$db_port = env('SUPABASE_DB_PORT', '5432');
$db_name = env('SUPABASE_DB_NAME', 'postgres');
$db_user = env('SUPABASE_DB_USER', '');
$db_pass = env('SUPABASE_DB_PASSWORD', '');

$pdo = null;

// Ensure pdo_pgsql extension is loaded for PostgreSQL database communication
if (extension_loaded('pdo_pgsql')) {
    try {
        $dsn = "pgsql:host={$db_host};port={$db_port};dbname={$db_name};sslmode=require";
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        // Fallback DSN without strict sslmode requirement for test environments
        try {
            $dsn_fallback = "pgsql:host={$db_host};port={$db_port};dbname={$db_name}";
            $pdo = new PDO($dsn_fallback, $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $ex) {
            $pdo = null;
        }
    }
}

// Global Authentication Helpers - Preserved for Application Compatibility
function get_current_user_id() {
    return $_SESSION['user_id'] ?? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
}

function is_logged_in() {
    return isset($_SESSION['user_id']);
}

function is_admin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

