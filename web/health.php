<?php
// NanoAnalyzer - Fast Health Check Endpoint for Cloud Platforms (Render, Railway, Kubernetes)
http_response_code(200);
header('Content-Type: text/plain; charset=utf-8');
echo 'OK';
exit;
