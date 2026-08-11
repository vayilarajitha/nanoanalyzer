<?php
// NanoUptake Analyzer - Environment Variable Loader
// Reads environment variables from getenv(), $_ENV, $_SERVER, apache_getenv(), secret files, and local .env

if (!function_exists('clean_env_val')) {
    function clean_env_val($val) {
        if ($val === null || $val === false) {
            return '';
        }
        $val = trim((string)$val);
        
        // Strip outer double or single quotes
        if ((strpos($val, '"') === 0 && substr($val, -1) === '"' && strlen($val) >= 2) || 
            (strpos($val, "'") === 0 && substr($val, -1) === "'" && strlen($val) >= 2)) {
            $val = substr($val, 1, -1);
            $val = trim($val);
        }

        // Strip outer square brackets if user copied placeholder with brackets (e.g. [YOUR-PASSWORD])
        if (strpos($val, '[') === 0 && substr($val, -1) === ']' && strlen($val) >= 2) {
            $val = substr($val, 1, -1);
            $val = trim($val);
        }

        // Detect and filter out unconfigured dummy placeholders
        $placeholders = [
            'xyz-your-supabase-project',
            'your_supabase_db_password',
            'your_supabase_anon_key',
            'your_supabase_service_role_key',
            'your_supabase_project_ref',
            'your_supabase_password',
            'your_password',
            'YOUR_PROJECT_REF',
            'YOUR_SUPABASE_ANON_KEY',
            'YOUR_SUPABASE_SERVICE_ROLE_KEY',
            'YOUR_SUPABASE_DB_PASSWORD',
            'YOUR-PASSWORD',
            'your-password',
            'YOUR_PASSWORD',
            'your_db_password'
        ];

        foreach ($placeholders as $ph) {
            if ($val === $ph || strpos($val, $ph) !== false) {
                return '';
            }
        }

        return $val;
    }
}

if (!function_exists('load_env')) {
    function load_env($file_path = null) {
        $paths_to_check = [];
        if ($file_path !== null) {
            $paths_to_check[] = $file_path;
        } else {
            $paths_to_check = [
                __DIR__ . '/../.env',
                __DIR__ . '/../../.env',
                '/etc/secrets/.env', // Render Secret Files mount path
            ];
        }

        $loaded = false;
        foreach ($paths_to_check as $path) {
            if (file_exists($path) && is_readable($path)) {
                $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                if ($lines !== false) {
                    foreach ($lines as $line) {
                        $line = trim($line);
                        if (empty($line) || strpos($line, '#') === 0) {
                            continue;
                        }

                        if (strpos($line, '=') !== false) {
                            list($key, $value) = explode('=', $line, 2);
                            $key = trim($key);
                            $value = clean_env_val($value);
                            
                            // Populate getenv, $_ENV, and $_SERVER if not already set by system/cloud env
                            $existing = getenv($key);
                            if ($existing === false || $existing === '') {
                                putenv("{$key}={$value}");
                            }
                            if (!isset($_ENV[$key]) || $_ENV[$key] === '') {
                                $_ENV[$key] = $value;
                            }
                            if (!isset($_SERVER[$key]) || $_SERVER[$key] === '') {
                                $_SERVER[$key] = $value;
                            }
                        }
                    }
                    $loaded = true;
                }
            }
        }
        return $loaded;
    }
}

// Auto load local .env if present
load_env();

if (!function_exists('env')) {
    function env($key, $default = null) {
        // 1. Check getenv()
        $val = getenv($key);
        if ($val !== false && $val !== '') {
            $clean = clean_env_val($val);
            if ($clean !== '') {
                return $clean;
            }
        }

        // 2. Check $_ENV
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            $clean = clean_env_val($_ENV[$key]);
            if ($clean !== '') {
                return $clean;
            }
        }

        // 3. Check $_SERVER
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            $clean = clean_env_val($_SERVER[$key]);
            if ($clean !== '') {
                return $clean;
            }
        }

        // 4. Check apache_getenv() if available
        if (function_exists('apache_getenv')) {
            $val = @apache_getenv($key);
            if ($val !== false && $val !== '') {
                $clean = clean_env_val($val);
                if ($clean !== '') {
                    return $clean;
                }
            }
        }

        return $default;
    }
}
