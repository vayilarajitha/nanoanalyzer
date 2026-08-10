<?php
// NanoUptake Analyzer - Environment Variable Loader
// Reads environment variables from getenv(), $_ENV, $_SERVER, and local .env file

if (!function_exists('load_env')) {
    function load_env($file_path = null) {
        if ($file_path === null) {
            $file_path = __DIR__ . '/../.env';
        }

        // Do not require .env in production if it does not exist
        if (!file_exists($file_path) || !is_readable($file_path)) {
            return false;
        }

        $lines = @file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return false;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }

            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Strip outer quotes if present
                if ((strpos($value, '"') === 0 && substr($value, -1) === '"') || 
                    (strpos($value, "'") === 0 && substr($value, -1) === "'")) {
                    $value = substr($value, 1, -1);
                }

                // Populate getenv, $_ENV, and $_SERVER if not already set by system/cloud env
                if (getenv($key) === false) {
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
        return true;
    }
}

// Auto load local .env if present
load_env();

if (!function_exists('env')) {
    function env($key, $default = null) {
        // 1. Check getenv()
        $val = getenv($key);
        if ($val !== false && $val !== '') {
            return $val;
        }
        // 2. Check $_ENV
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }
        // 3. Check $_SERVER
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            return $_SERVER[$key];
        }
        return $default;
    }
}
