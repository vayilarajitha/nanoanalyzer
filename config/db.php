<?php
// NanoUptake Analyzer - Supabase Cloud Database Connection Layer
// Direct PostgreSQL Connection via PDO (pdo_pgsql) driven strictly by environment variables

if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    session_start();
}

require_once __DIR__ . '/../includes/env_loader.php';

// Helper function to robustly parse PostgreSQL connection URI (e.g. DATABASE_URL)
// Correctly handles special characters (@, :, #, %, $, etc.) in passwords and query parameters
if (!function_exists('parse_pg_url')) {
    function parse_pg_url($url) {
        if (empty($url) || !is_string($url)) {
            return false;
        }

        $url = trim($url);
        // Strip outer quotes/brackets
        if ((strpos($url, '"') === 0 && substr($url, -1) === '"') || 
            (strpos($url, "'") === 0 && substr($url, -1) === "'")) {
            $url = substr($url, 1, -1);
        }

        // Match scheme (postgres:// or postgresql://)
        if (!preg_match('#^postgres(?:ql)?://(.*)$#i', $url, $m)) {
            return false;
        }

        $rest = $m[1];

        $result = [
            'host' => '',
            'port' => '',
            'user' => '',
            'pass' => '',
            'name' => 'postgres',
            'sslmode' => 'require'
        ];

        // 1. Separate query parameters (?sslmode=...)
        $query_str = '';
        if (strpos($rest, '?') !== false) {
            list($rest, $query_str) = explode('?', $rest, 2);
            parse_str($query_str, $queryParams);
            if (!empty($queryParams['sslmode'])) {
                $result['sslmode'] = clean_env_val($queryParams['sslmode']);
            }
        }

        // 2. Separate database path (/postgres)
        if (strpos($rest, '/') !== false) {
            list($authority, $path) = explode('/', $rest, 2);
            $db_name = trim($path, '/');
            if (!empty($db_name)) {
                $result['name'] = clean_env_val($db_name);
            }
        } else {
            $authority = $rest;
        }

        // 3. Separate user:pass from host:port by finding the LAST '@' character
        $last_at = strrpos($authority, '@');
        if ($last_at !== false) {
            $userpass = substr($authority, 0, $last_at);
            $hostport = substr($authority, $last_at + 1);

            if (strpos($userpass, ':') !== false) {
                list($u, $p) = explode(':', $userpass, 2);
                $result['user'] = clean_env_val(rawurldecode($u));
                $result['pass'] = clean_env_val(rawurldecode($p));
            } else {
                $result['user'] = clean_env_val(rawurldecode($userpass));
            }
        } else {
            $hostport = $authority;
        }

        // 4. Parse host and port
        $hostport = trim($hostport);
        // Check for IPv6 bracket notation [::1]:5432
        if (preg_match('#^\[([^\]]+)\](?::(\d+))?$#', $hostport, $ip6_matches)) {
            $result['host'] = $ip6_matches[1];
            if (!empty($ip6_matches[2])) {
                $result['port'] = $ip6_matches[2];
            }
        } elseif (strpos($hostport, ':') !== false) {
            list($h, $port) = explode(':', $hostport, 2);
            $result['host'] = clean_env_val($h);
            $result['port'] = clean_env_val($port);
        } else {
            $result['host'] = clean_env_val($hostport);
        }

        return $result;
    }
}

// 1. Resolve unified PostgreSQL connection URL (standard on Render / Supabase / Railway)
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
        $db_host = $parsed_db['host'] ?? '';
        $db_port = $parsed_db['port'] ?? '';
        $db_user = $parsed_db['user'] ?? '';
        $db_pass = $parsed_db['pass'] ?? '';
        $db_name = $parsed_db['name'] ?? '';
        $sslmode = !empty($parsed_db['sslmode']) ? $parsed_db['sslmode'] : 'require';
    }
}

// 2. Discrete environment variables fallback
if (empty($db_host)) {
    $db_host = env('SUPABASE_DB_HOST') ?: env('DB_HOST') ?: env('POSTGRES_HOST') ?: env('PGHOST') ?: '';
}
if (empty($db_port)) {
    $db_port = env('SUPABASE_DB_PORT') ?: env('DB_PORT') ?: env('POSTGRES_PORT') ?: env('PGPORT') ?: '';
}
if (empty($db_name)) {
    $db_name = env('SUPABASE_DB_NAME') ?: env('DB_NAME') ?: env('POSTGRES_DB') ?: env('POSTGRES_DATABASE') ?: env('PGDATABASE') ?: 'postgres';
}
if (empty($db_user)) {
    $db_user = env('SUPABASE_DB_USER') ?: env('DB_USER') ?: env('DB_USERNAME') ?: env('POSTGRES_USER') ?: env('PGUSER') ?: '';
}
if (empty($db_pass)) {
    $db_pass = env('SUPABASE_DB_PASSWORD') ?: env('SUPABASE_DB_PASS') ?: env('DB_PASSWORD') ?: env('DB_PASS') ?: env('POSTGRES_PASSWORD') ?: env('PGPASSWORD') ?: env('SUPABASE_PASSWORD') ?: '';
}

// 3. Extract Supabase Project Reference (e.g. 'sjcngccbqwdpdliffsgz')
$project_ref = '';
$supabase_url = env('SUPABASE_URL', '');
if (!empty($supabase_url) && preg_match('#https?://([a-z0-9_-]+)\.supabase\.co#i', $supabase_url, $m_url)) {
    $project_ref = $m_url[1];
} elseif (!empty($db_host) && preg_match('#db\.([a-z0-9_-]+)\.supabase\.co#i', $db_host, $m_host)) {
    $project_ref = $m_host[1];
} elseif (!empty($db_user) && preg_match('#^postgres\.([a-z0-9_-]+)$#i', $db_user, $m_usr)) {
    $project_ref = $m_usr[1];
}

// 4. Intelligent defaults for host, user, and port
if (empty($db_host) && !empty($project_ref)) {
    // Prefer Supabase IPv4-compatible pooler host for cloud deployments (Render)
    $db_host = 'aws-0-us-east-1.pooler.supabase.com';
}

$is_pooler = (!empty($db_host) && strpos($db_host, 'pooler.supabase.com') !== false);

if (empty($db_user)) {
    if ($is_pooler && !empty($project_ref)) {
        $db_user = 'postgres.' . $project_ref;
    } else {
        $db_user = 'postgres';
    }
} elseif ($is_pooler && $db_user === 'postgres' && !empty($project_ref)) {
    // Supabase Pooler requires username in the format 'postgres.[project_ref]'
    $db_user = 'postgres.' . $project_ref;
}

if (empty($db_port)) {
    $db_port = $is_pooler ? '6543' : '5432';
}

if (empty($db_name)) {
    $db_name = 'postgres';
}

// 5. Multi-tier Candidate Connection Strategy for Supabase PostgreSQL
$candidates = [];

if (!empty($db_host) && !empty($db_user) && !empty($db_pass)) {
    // Candidate 1: Direct configured host/port with sslmode=require
    $candidates[] = [
        'host' => $db_host,
        'port' => $db_port,
        'user' => $db_user,
        'pass' => $db_pass,
        'name' => $db_name,
        'ssl'  => $sslmode ?: 'require',
        'desc' => "Configured ({$db_host}:{$db_port})"
    ];

    // Candidate 2: If pooler on 5432 (session mode), try 6543 (transaction mode - best for cloud apps)
    if ($is_pooler && $db_port === '5432') {
        $candidates[] = [
            'host' => $db_host,
            'port' => '6543',
            'user' => $db_user,
            'pass' => $db_pass,
            'name' => $db_name,
            'ssl'  => 'require',
            'desc' => "Pooler Transaction Mode ({$db_host}:6543)"
        ];
    }

    // Candidate 3: If pooler on 6543, try 5432 (session mode)
    if ($is_pooler && $db_port === '6543') {
        $candidates[] = [
            'host' => $db_host,
            'port' => '5432',
            'user' => $db_user,
            'pass' => $db_pass,
            'name' => $db_name,
            'ssl'  => 'require',
            'desc' => "Pooler Session Mode ({$db_host}:5432)"
        ];
    }

    // Candidate 4: If host was direct (db.ref.supabase.co), try pooler host aws-0-us-east-1.pooler.supabase.com (IPv4-compatible)
    if (!$is_pooler && !empty($project_ref)) {
        $pooler_user = (strpos($db_user, '.') !== false) ? $db_user : ('postgres.' . $project_ref);
        $candidates[] = [
            'host' => 'aws-0-us-east-1.pooler.supabase.com',
            'port' => '6543',
            'user' => $pooler_user,
            'pass' => $db_pass,
            'name' => $db_name,
            'ssl'  => 'require',
            'desc' => "Supabase IPv4 Pooler Fallback (aws-0-us-east-1.pooler.supabase.com:6543)"
        ];
        $candidates[] = [
            'host' => 'aws-0-us-east-1.pooler.supabase.com',
            'port' => '5432',
            'user' => $pooler_user,
            'pass' => $db_pass,
            'name' => $db_name,
            'ssl'  => 'require',
            'desc' => "Supabase IPv4 Pooler Session Fallback (aws-0-us-east-1.pooler.supabase.com:5432)"
        ];
    }

    // Candidate 5: If pooler host failed and direct host is known, try direct connection
    if ($is_pooler && !empty($project_ref)) {
        $candidates[] = [
            'host' => "db.{$project_ref}.supabase.co",
            'port' => '5432',
            'user' => 'postgres',
            'pass' => $db_pass,
            'name' => $db_name,
            'ssl'  => 'require',
            'desc' => "Supabase Direct Connection Fallback (db.{$project_ref}.supabase.co:5432)"
        ];
    }

    // Candidate 6: Fallback with sslmode=prefer
    $candidates[] = [
        'host' => $db_host,
        'port' => $db_port,
        'user' => $db_user,
        'pass' => $db_pass,
        'name' => $db_name,
        'ssl'  => 'prefer',
        'desc' => "SSL Prefer Fallback ({$db_host}:{$db_port})"
    ];
}

$pdo = null;
$GLOBALS['db_connection_error'] = null;
$connection_errors = [];

if (extension_loaded('pdo_pgsql') && !empty($candidates)) {
    $pdo_options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ];

    foreach ($candidates as $cand) {
        try {
            $dsn = "pgsql:host={$cand['host']};port={$cand['port']};dbname={$cand['name']};sslmode={$cand['ssl']};connect_timeout=8";
            $conn = new PDO($dsn, $cand['user'], $cand['pass'], $pdo_options);
            
            // Validate connection with quick ping
            $conn->query("SELECT 1");
            $pdo = $conn;
            $GLOBALS['db_connection_active'] = $cand['desc'];
            break;
        } catch (Throwable $e) {
            $connection_errors[] = "{$cand['desc']} failed: " . $e->getMessage();
        }
    }
}

if ($pdo === null) {
    if (!extension_loaded('pdo_pgsql')) {
        $GLOBALS['db_connection_error'] = "PHP pdo_pgsql extension is not enabled in PHP environment.";
    } elseif (empty($db_pass)) {
        $GLOBALS['db_connection_error'] = "Database password is missing. Please set DATABASE_URL or SUPABASE_DB_PASSWORD in Render Environment Variables.";
    } elseif (empty($db_host)) {
        $GLOBALS['db_connection_error'] = "Database host is missing. Please set DATABASE_URL or SUPABASE_DB_HOST in Render Environment Variables.";
    } else {
        $GLOBALS['db_connection_error'] = !empty($connection_errors) ? implode(" | ", array_slice($connection_errors, 0, 2)) : "PostgreSQL connection failed.";
    }
}

$GLOBALS['pdo'] = $pdo;

// Global Helper Functions
if (!function_exists('get_db_connection')) {
    function get_db_connection() {
        global $pdo;
        return $pdo;
    }
}

if (!function_exists('get_db_error')) {
    function get_db_error() {
        return $GLOBALS['db_connection_error'] ?? null;
    }
}

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
