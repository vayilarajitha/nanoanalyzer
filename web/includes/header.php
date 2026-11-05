<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$page_title = $page_title ?? 'NanoAnalyzer | Nanoparticle Uptake Platform';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($page_title); ?></title>
  
  <!-- SEO & Meta Tags -->
  <meta name="description" content="NanoAnalyzer is an enterprise biomedical platform for simulating nanoparticle cellular uptake, predicting drug delivery efficiency, managing lab datasets, and performing deterministic AI analytics.">
  <meta name="keywords" content="nanoparticle, drug delivery, cellular uptake, nanomedicine, machine learning, biophysics simulation">
  
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
