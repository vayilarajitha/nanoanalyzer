<?php
require_once __DIR__ . '/config/db.php';
require_login();

$filePath = __DIR__ . '/NanoAnalyzer_Selenium_Test_Report.xlsx';
$downloadName = 'NanoAnalyzer_Selenium_Test_Report_175_PASS.xlsx';

if (!file_exists($filePath)) {
    http_response_code(404);
    die('Test report not found on server.');
}

header('Content-Description: File Transfer');
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));
ob_clean();
flush();
readfile($filePath);
exit;
