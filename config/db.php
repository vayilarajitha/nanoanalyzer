<?php
// NanoUptake Analyzer - Supabase Cloud Database Connection Layer
// Direct PostgreSQL Connection via PDO (pdo_pgsql) driven strictly by environment variables

if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    session_start();
}

require_once __DIR__ . '/../includes/env_loader.php';
require_once __DIR__ . '/../includes/supabase_client.php';

// Helper function to robustly parse PostgreSQL connection URI (e.g. DATABASE_URL)
if (!function_exists('parse_pg_url')) {
    function parse_pg_url($url) {
        if (empty($url) || !is_string($url)) {
            return false;
        }

        $result = [
            'host' => '',
            'port' => '',
            'user' => '',
            'pass' => '',
            'name' => '',
            'sslmode' => 'require'
        ];

        // 1. Standard parse_url
        $parsed = parse_url($url);
        if ($parsed !== false && !empty($parsed['host'])) {
            $result['host'] = $parsed['host'];
            $result['port'] = isset($parsed['port']) ? (string)$parsed['port'] : '';
            $result['user'] = isset($parsed['user']) ? rawurldecode($parsed['user']) : '';
            $result['pass'] = isset($parsed['pass']) ? rawurldecode($parsed['pass']) : '';
            if (!empty($parsed['path'])) {
                $result['name'] = ltrim($parsed['path'], '/');
            }
            if (!empty($parsed['query'])) {
                parse_str($parsed['query'], $queryParams);
                if (!empty($queryParams['sslmode'])) {
                    $result['sslmode'] = $queryParams['sslmode'];
                }
            }
            return $result;
        }

        // 2. Regex fallback for unescaped characters in passwords
        if (preg_match('#^postgres(?:ql)?://(?:([^:]+)(?::([^@]*))?@)?([^:/]+)(?::(\d+))?(?:/([^?#]*))?(?:\?(.*))?#i', $url, $matches)) {
            $result['user'] = isset($matches[1]) ? rawurldecode($matches[1]) : '';
            $result['pass'] = isset($matches[2]) ? rawurldecode($matches[2]) : '';
            $result['host'] = $matches[3] ?? '';
            $result['port'] = $matches[4] ?? '';
            $result['name'] = isset($matches[5]) ? ltrim($matches[5], '/') : '';
            if (!empty($matches[6])) {
                parse_str($matches[6], $queryParams);
                if (!empty($queryParams['sslmode'])) {
                    $result['sslmode'] = $queryParams['sslmode'];
                }
            }
            return $result;
        }

        return false;
    }
}

// Check for unified PostgreSQL connection URL (standard on Render / Supabase / Railway / Heroku)
$db_url = env('DATABASE_URL') ?: env('SUPABASE_DB_URL') ?: env('SUPABASE_DATABASE_URL') ?: env('POSTGRES_URL') ?: env('POSTGRESQL_URL');

$db_host = '';
$db_port = '';
$db_name = '';
$db_user = '';
$db_pass = '';
$sslmode = 'require';

if (!empty($db_url)) {
    $parsed_db = parse_pg_url($db_url);
    if ($parsed_db !== false) {
        $db_host = $parsed_db['host'];
        $db_port = $parsed_db['port'];
        $db_user = $parsed_db['user'];
        $db_pass = $parsed_db['pass'];
        $db_name = $parsed_db['name'];
        $sslmode = $parsed_db['sslmode'] ?: 'require';
    }
}

// Fallback to discrete environment variables if not populated via connection URL
if (empty($db_host)) {
    $db_host = env('SUPABASE_DB_HOST') ?: env('DB_HOST') ?: env('POSTGRES_HOST') ?: '';
}
if (empty($db_port)) {
    $db_port = env('SUPABASE_DB_PORT') ?: env('DB_PORT') ?: env('POSTGRES_PORT') ?: '5432';
}
if (empty($db_name)) {
    $db_name = env('SUPABASE_DB_NAME') ?: env('DB_NAME') ?: env('POSTGRES_DB') ?: env('POSTGRES_DATABASE') ?: 'postgres';
}
if (empty($db_user)) {
    $db_user = env('SUPABASE_DB_USER') ?: env('DB_USER') ?: env('DB_USERNAME') ?: env('POSTGRES_USER') ?: '';
}
if (empty($db_pass)) {
    $db_pass = env('SUPABASE_DB_PASSWORD') ?: env('SUPABASE_DB_PASS') ?: env('DB_PASSWORD') ?: env('DB_PASS') ?: env('POSTGRES_PASSWORD') ?: '';
}

// Auto-infer user if Supabase project URL is provided and user is empty
$supabase_url = env('SUPABASE_URL', '');
if (empty($db_user) && !empty($supabase_url) && preg_match('#https?://([^.]+)\.supabase\.co#', $supabase_url, $matches)) {
    $project_ref = $matches[1];
    if (!empty($db_host) && strpos($db_host, 'pooler.supabase.com') !== false) {
        $db_user = 'postgres.' . $project_ref;
    } else {
        $db_user = 'postgres';
    }
}

$pdo = null;

// Connect via PDO pdo_pgsql extension when configured
if (extension_loaded('pdo_pgsql') && !empty($db_host) && !empty($db_user)) {
    $pdo_options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 5,
    ];

    // Attempt 1: Connection with SSL mode=require (standard for Supabase PostgreSQL)
    try {
        $dsn = "pgsql:host={$db_host};port={$db_port};dbname={$db_name};sslmode={$sslmode}";
        $pdo = new PDO($dsn, $db_user, $db_pass, $pdo_options);
    } catch (Throwable $e1) {
        // Attempt 2: If host is pooler and port was 5432, try transaction pooler port 6543
        if (strpos($db_host, 'pooler.supabase.com') !== false && ($db_port === '5432' || empty($db_port))) {
            try {
                $dsn_pooler = "pgsql:host={$db_host};port=6543;dbname={$db_name};sslmode=require";
                $pdo = new PDO($dsn_pooler, $db_user, $db_pass, $pdo_options);
            } catch (Throwable $e2) {
                // Attempt 3: Try without explicit sslmode
                try {
                    $dsn_fallback = "pgsql:host={$db_host};port={$db_port};dbname={$db_name}";
                    $pdo = new PDO($dsn_fallback, $db_user, $db_pass, $pdo_options);
                } catch (Throwable $e3) {
                    $pdo = null;
                }
            }
        } else {
            // Attempt 2 (non-pooler): Try without explicit sslmode
            try {
                $dsn_fallback = "pgsql:host={$db_host};port={$db_port};dbname={$db_name}";
                $pdo = new PDO($dsn_fallback, $db_user, $db_pass, $pdo_options);
            } catch (Throwable $e2) {
                $pdo = null;
            }
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
