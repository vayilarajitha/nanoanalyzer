<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'AI Assistant | NanoAnalyzer';
include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-white fw-bold mb-1">NanoBot AI Research Assistant</h2>
          <p class="text-muted mb-0">Biophysical simulation guidance, nanoparticle endocytosis pathways, and toxicity modeling.</p>
        </div>
        <span class="badge badge-tech emerald px-3 py-2"><i class="bi bi-robot me-1"></i> Biophysical Engine Online</span>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-8">
          <div class="glass-panel d-flex flex-column" style="min-height: 550px; height: 70vh;">
            
            <!-- Chat Header -->
            <div class="p-3 border-bottom border-secondary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle p-2 d-flex align-items-center justify-content-center" style="width:40px; height:40px; background:var(--cyan);">
                  <i class="bi bi-robot text-dark fs-5"></i>
                </div>
                <div>
                  <h6 class="mb-0 text-white font-bold">NanoBot Biomedical Specialist</h6>
                  <small class="text-emerald font-semibold">● Instant Offline-Capable Engine | Non-API</small>
                </div>
              </div>
              <button class="btn btn-sm btn-glass" onclick="clearPageChat()"><i class="bi bi-arrow-counterclockwise me-1"></i> Clear</button>
            </div>

            <!-- Chat Message List -->
            <div class="flex-grow-1 p-4 overflow-auto" id="page-chat-body" style="background: rgba(15, 23, 42, 0.4);">
              <div class="chat-msg bot mb-3">
                Greetings! I am NanoBot, your AI specialist in nanoparticle cellular uptake kinetics and drug delivery optimization. How can I assist your biophysical analysis today?
              </div>

              <div class="mb-3 d-flex flex-wrap gap-2" id="page-chat-chips">
                <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Optimal size for HeLa?</button>
                <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Surface charge effects?</button>
                <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Endocytosis pathways</button>
                <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Toxicity limits</button>
              </div>
            </div>

            <!-- Chat Input Footer -->
            <div class="p-3 border-top border-secondary">
              <div class="input-group">
                <input type="text" id="page-chat-input" class="form-control bg-dark text-white border-secondary" placeholder="Ask NanoBot about nanoparticle size, charge, pathways, or cell lines..." autocomplete="off">
                <button class="btn btn-glow-cyan" id="page-chat-send" onclick="handlePageSend()">
                  <i class="bi bi-send-fill me-1"></i> Send
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
function sendPrompt(text) {
  const input = document.getElementById('page-chat-input');
  if (input) {
    input.value = text;
    handlePageSend();
  }
}

function handlePageSend() {
  const input = document.getElementById('page-chat-input');
  const chatBody = document.getElementById('page-chat-body');
  if (!input || !chatBody) return;

  const text = input.value.trim();
  if (!text) return;

  // Append user message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-msg user mb-3';
  userDiv.textContent = text;
  chatBody.appendChild(userDiv);
  input.value = '';

  // Append typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot typing-indicator mb-3';
  typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Resolve response
  setTimeout(() => {
    typingDiv.remove();
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot mb-3';
    botDiv.textContent = resolveBotResponse(text);
    chatBody.appendChild(botDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 350);
}

function clearPageChat() {
  const chatBody = document.getElementById('page-chat-body');
  if (chatBody) {
    chatBody.innerHTML = `
      <div class="chat-msg bot mb-3">
        Greetings! I am NanoBot, your AI specialist in nanoparticle cellular uptake kinetics and drug delivery optimization. How can I assist your biophysical analysis today?
      </div>
      <div class="mb-3 d-flex flex-wrap gap-2">
        <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Optimal size for HeLa?</button>
        <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Surface charge effects?</button>
        <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Endocytosis pathways</button>
        <button class="chip-btn btn btn-sm btn-glass text-cyan" onclick="sendPrompt(this.innerText)">Toxicity limits</button>
      </div>
    `;
  }
}

document.getElementById('page-chat-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handlePageSend();
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
