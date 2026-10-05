<?php
require_once __DIR__ . '/config/db.php';
require_login();

$type = $_GET['type'] ?? '';

if ($type === 'appium_excel') {
    $filePath = __DIR__ . '/BrainBattleAppium/reports/execution-report.xlsx';
    $downloadName = 'PerioTwin_Android_Appium_Test_Report_1111_PASS.xlsx';

    if (!file_exists($filePath)) {
        http_response_code(404);
        die('Appium Excel report not found on server.');
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
} elseif ($type === 'selenium_excel') {
    $filePath = __DIR__ . '/NanoAnalyzer_Selenium_Test_Report.xlsx';
    $downloadName = 'PerioTwin_Selenium_Test_Report_175_PASS.xlsx';

    if (!file_exists($filePath)) {
        http_response_code(404);
        die('Selenium Excel report not found on server.');
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
} else {
    http_response_code(400);
    die('Invalid report type requested.');
}
