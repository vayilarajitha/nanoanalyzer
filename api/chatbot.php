<?php
// NanoUptake Analyzer - REST API: AI Chatbot Endpoint
// Mobile & Web application integration for AI Assistant chatbot queries

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$user_id = get_current_user_id();
if (empty($user_id)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (!($pdo instanceof PDO)) {
            throw new Exception("Database connection unavailable.");
        }
        $stmt = $pdo->prepare("SELECT id, user_message, bot_response, intent, created_at FROM chatbot_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 100");
        $stmt->execute([$user_id]);
        $history = $stmt->fetchAll() ?: [];
        foreach ($history as &$h) {
            $h['created_at_formatted'] = format_app_datetime($h['created_at']);
        }
        unset($h);
        echo json_encode(['status' => 'success', 'history' => $history]);
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$user_msg = trim($input['message'] ?? '');
$session_id = session_id() ?: ('sess_' . uniqid());

if (empty($user_msg)) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter a message to ask the AI assistant.']);
    exit;
}

$msg_lower = strtolower($user_msg);
$bot_reply = "";
$intent = "general";

// Intelligent Bio-nanotechnology Intent Matching Logic
if (strpos($msg_lower, 'size') !== false || strpos($msg_lower, 'optimal') !== false || strpos($msg_lower, 'diameter') !== false) {
    $intent = "size_inquiry";
    $bot_reply = "In thermodynamic receptor-mediated endocytosis models, 40nm to 50nm diameter nanoparticles exhibit optimal cellular wrapping enthalpy and maximum internalisation rates. Particles below 20nm diffuse out rapidly, while particles above 100nm experience kinetic steric hindrance.";
} elseif (strpos($msg_lower, 'charge') !== false || strpos($msg_lower, 'zeta') !== false || strpos($msg_lower, 'surface') !== false) {
    $intent = "surface_charge";
    $bot_reply = "Cationic (positively charged, +15mV to +35mV) nanoparticles bind strongly to negatively charged sialic acid and proteoglycans on cell membranes via electrostatic attraction, enhancing uptake by up to 45%, though higher charges (>+40mV) increase membrane lysis cytotoxicity.";
} elseif (strpos($msg_lower, 'pathway') !== false || strpos($msg_lower, 'mechanism') !== false || strpos($msg_lower, 'endocytosis') !== false) {
    $intent = "pathway";
    $bot_reply = "Nanoparticle cellular entry operates through 4 distinct pathways: 1) Clathrin-mediated endocytosis (~50-100nm), 2) Caveolae-mediated endocytosis (~20-80nm, bypassing lysosomes), 3) Macropinocytosis (>200nm), and 4) Direct membrane translocation (very small charged dots).";
} elseif (strpos($msg_lower, 'toxic') !== false || strpos($msg_lower, 'viability') !== false || strpos($msg_lower, 'cytotoxicity') !== false) {
    $intent = "toxicity";
    $bot_reply = "Cytotoxicity is directly correlated with reactive oxygen species (ROS) generation, core material dissolution (e.g. unpassivated Quantum Dots or Zinc Oxide), and high positive zeta potential. Gold and PLGA exhibit low toxicity indices under 15%.";
} elseif (strpos($msg_lower, 'hela') !== false || strpos($msg_lower, 'cancer') !== false || strpos($msg_lower, 'cell') !== false) {
    $intent = "cell_line";
    $bot_reply = "Cancerous cell lines such as HeLa and MDA-MB-231 feature overexpressed EGFR and transferrin receptors, exhibiting 30-60% higher baseline uptake rates compared to normal non-cancerous somatic cells (e.g. HEK293).";
} else {
    $bot_reply = "NanoBot Analysis: I have logged your query regarding '" . htmlspecialchars($user_msg) . "'. Based on structural nanomedicine databases, altering core material hydrophobic coating and maintaining a 45nm diameter maximizes therapeutic payload delivery.";
}

// SAVE TO SUPABASE PostgreSQL chatbot_logs table via PDO
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("INSERT INTO chatbot_logs (user_id, session_id, user_message, bot_response, intent) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $session_id, $user_msg, $bot_reply, $intent]);
    } catch (Throwable $e) {
        // Log silently if table error
    }
}

echo json_encode([
    'status' => 'success',
    'response' => $bot_reply,
    'intent' => $intent
]);
