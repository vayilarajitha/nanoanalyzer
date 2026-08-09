<?php
// NanoUptake Analyzer - Supabase REST & Storage Client Wrapper
// Handles Supabase Cloud Authentication, Storage Buckets, and REST Table operations

require_once __DIR__ . '/env_loader.php';

class SupabaseClient {
    private string $url;
    private string $anonKey;
    private string $serviceKey;

    public function __construct() {
        $this->url = rtrim(env('SUPABASE_URL', 'https://xyz-your-supabase-project.supabase.co'), '/');
        $this->anonKey = env('SUPABASE_ANON_KEY', '');
        $this->serviceKey = env('SUPABASE_SERVICE_ROLE_KEY', '');
    }

    public function isConfigured(): bool {
        return !empty($this->url) && !empty($this->anonKey) && strpos($this->url, 'xyz-your-supabase-project') === false;
    }

    public function getUrl(): string {
        return $this->url;
    }

    public function getAnonKey(): string {
        return $this->anonKey;
    }

    /**
     * Perform HTTP REST Request to Supabase API
     */
    public function request(string $endpoint, string $method = 'GET', array $data = [], array $extraHeaders = []) {
        $fullUrl = $this->url . '/' . ltrim($endpoint, '/');

        $headers = array_merge([
            'apikey: ' . $this->anonKey,
            'Authorization: Bearer ' . ($this->serviceKey ?: $this->anonKey),
            'Content-Type: application/json',
            'Prefer: return=representation'
        ], $extraHeaders);

        $ch = curl_init($fullUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        if (!empty($data) && in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'status' => $httpCode,
            'data' => json_decode($response, true) ?? $response
        ];
    }

    /**
     * Upload a file to Supabase Storage Bucket
     */
    public function uploadFile(string $bucket, string $filePath, string $mimeType, string $fileContent): array {
        $endpoint = "storage/v1/object/{$bucket}/{$filePath}";
        $fullUrl = $this->url . '/' . $endpoint;

        $headers = [
            'apikey: ' . $this->anonKey,
            'Authorization: Bearer ' . ($this->serviceKey ?: $this->anonKey),
            'Content-Type: ' . $mimeType,
            'x-upsert: true'
        ];

        $ch = curl_init($fullUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $publicUrl = "{$this->url}/storage/v1/object/public/{$bucket}/{$filePath}";

        return [
            'status' => $httpCode,
            'public_url' => $publicUrl,
            'response' => json_decode($response, true) ?? $response
        ];
    }
}

// Global helper function to get Supabase client instance
function supabase() {
    static $client = null;
    if ($client === null) {
        $client = new SupabaseClient();
    }
    return $client;
}

