<?php
// NanoAnalyzer - Fast Health Check Endpoint for Cloud Platforms
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'healthy', 'timestamp' => time()]);
exit;
