<!-- Floating AI Chatbot Component -->
<div id="chatbot-floating-wrapper" class="no-print">
  <!-- Launcher Button -->
  <button id="chatbot-toggle-btn" title="Ask NanoBot AI Assistant">
    <i class="bi bi-robot"></i>
  </button>

  <!-- Chatbot Window Modal -->
  <div id="chatbot-modal" class="glass-panel">
    <div class="chat-header">
      <div class="d-flex align-items-center gap-2">
        <div class="rounded-circle p-2 bg-gradient-cyan d-flex align-items-center justify-content-center" style="width:32px; height:32px; background:var(--cyan);">
          <i class="bi bi-robot text-dark fs-6"></i>
        </div>
        <div>
          <h6 class="mb-0 text-white font-bold">NanoBot AI Assistant</h6>
          <small class="text-emerald font-semibold" style="font-size:0.7rem;">● Online | Biophysical Engine</small>
        </div>
      </div>
      <button id="chatbot-close-btn" class="btn btn-sm text-muted p-0 border-0">
        <i class="bi bi-x-lg fs-6"></i>
      </button>
    </div>

    <!-- Chat Body -->
    <div class="chat-body" id="chat-body">
      <div class="chat-msg bot">
        Greetings! I am NanoBot, your AI specialist in nanoparticle uptake kinetics & drug delivery. How can I assist your analysis today?
      </div>

      <div class="chat-suggestions">
        <button class="chip-btn">Optimal size for HeLa?</button>
        <button class="chip-btn">Surface charge effects?</button>
        <button class="chip-btn">Endocytosis pathways</button>
        <button class="chip-btn">Toxicity limits</button>
      </div>
    </div>

    <!-- Chat Footer Input -->
    <div class="chat-footer">
      <div class="input-group">
        <input type="text" id="chatbot-input" class="form-control" placeholder="Ask NanoBot..." autocomplete="off">
        <button class="btn btn-glow-cyan" id="chatbot-send-btn">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  </div>
</div>
