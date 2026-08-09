<?php
// NanoUptake Analyzer - Environment Variable Loader
// Parses .env configuration securely into $_ENV, $_SERVER, and getenv()

if (!function_exists('load_env')) {
    function load_env($file_path = null) {
        if ($file_path === null) {
            $file_path = __DIR__ . '/../.env';
        }

        if (!file_exists($file_path)) {
            return false;
        }

        $lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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

                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
        return true;
    }
}

// Auto load .env on include
load_env();

function env($key, $default = null) {
    return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default;
}
