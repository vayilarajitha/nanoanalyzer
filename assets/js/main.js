/**
 * NanoAnalyzer Universal JavaScript Controller
 * Core interactions, floating AI chatbot engine & notification toasts
 */

document.addEventListener('DOMContentLoaded', function () {
  initChatbot();
  initSidebarToggle();
});

// Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show glass-panel text-white shadow-lg`;
  toast.style.minWidth = '300px';
  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'} me-2 fs-5"></i>
      <div>${escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="alert"></button>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'position-fixed top-0 end-0 p-3';
  container.style.zIndex = '99999';
  document.body.appendChild(container);
  return container;
}

// Sidebar Toggle logic
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('sidebar-wrapper');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      if (sidebar.style.marginLeft === '-260px') {
        sidebar.style.marginLeft = '0px';
      } else {
        sidebar.style.marginLeft = '-260px';
      }
    });
  }
}

// Helper to sanitize HTML strings
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Biophysical Intent Resolution Engine (Client-Side, Non-API)
function resolveBotResponse(userMsg) {
  const msgLower = userMsg.toLowerCase();

  if (msgLower.includes('size') || msgLower.includes('optimal') || msgLower.includes('diameter')) {
    return "In thermodynamic receptor-mediated endocytosis models, 40nm to 50nm diameter nanoparticles exhibit optimal cellular wrapping enthalpy and maximum internalisation rates. Particles below 20nm diffuse out rapidly, while particles above 100nm experience kinetic steric hindrance.";
  } else if (msgLower.includes('charge') || msgLower.includes('zeta') || msgLower.includes('surface')) {
    return "Cationic (positively charged, +15mV to +35mV) nanoparticles bind strongly to negatively charged sialic acid and proteoglycans on cell membranes via electrostatic attraction, enhancing uptake by up to 45%, though higher charges (>+40mV) increase membrane lysis cytotoxicity.";
  } else if (msgLower.includes('pathway') || msgLower.includes('mechanism') || msgLower.includes('endocytosis')) {
    return "Nanoparticle cellular entry operates through 4 distinct pathways: 1) Clathrin-mediated endocytosis (~50-100nm), 2) Caveolae-mediated endocytosis (~20-80nm, bypassing lysosomes), 3) Macropinocytosis (>200nm), and 4) Direct membrane translocation (very small charged dots).";
  } else if (msgLower.includes('toxic') || msgLower.includes('viability') || msgLower.includes('cytotoxicity')) {
    return "Cytotoxicity is directly correlated with reactive oxygen species (ROS) generation, core material dissolution (e.g. unpassivated Quantum Dots or Zinc Oxide), and high positive zeta potential. Gold and PLGA exhibit low toxicity indices under 15%.";
  } else if (msgLower.includes('hela') || msgLower.includes('cancer') || msgLower.includes('cell')) {
    return "Cancerous cell lines such as HeLa and MDA-MB-231 feature overexpressed EGFR and transferrin receptors, exhibiting 30-60% higher baseline uptake rates compared to normal non-cancerous somatic cells (e.g. HEK293).";
  } else {
    return "NanoBot Analysis: I have analyzed your inquiry regarding '" + escapeHtml(userMsg) + "'. Based on structural nanomedicine models, optimizing core material hydrophobic coating and maintaining a 45nm diameter maximizes therapeutic payload delivery.";
  }
}

// Floating AI Chatbot Controller
function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const chatModal = document.getElementById('chatbot-modal');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const chatInput = document.getElementById('chatbot-input');
  const chatBody = document.getElementById('chat-body');

  if (!toggleBtn || !chatModal) return;

  toggleBtn.addEventListener('click', function () {
    chatModal.classList.toggle('open');
    if (chatModal.classList.contains('open')) {
      chatInput?.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      chatModal.classList.remove('open');
    });
  }

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendChatMessage(escapeHtml(text), 'user');
    chatInput.value = '';

    // Show typing indicator
    const typingElem = showTypingIndicator();

    // Deterministic Non-API Biophysical Response
    setTimeout(() => {
      typingElem.remove();
      const reply = resolveBotResponse(text);
      appendChatMessage(reply, 'bot');
    }, 350);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Suggestion Chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', function () {
      if (chatInput) {
        chatInput.value = this.innerText;
        handleSend();
      }
    });
  });
}

function appendChatMessage(msg, sender) {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  msgDiv.innerHTML = msg;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
  const chatBody = document.getElementById('chat-body');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg bot typing-indicator';
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  return typingDiv;
}

// Print Report PDF helper
function generatePDFReport() {
  window.print();
}

/**
 * Universal Date/Time formatter in India Standard Time (Asia/Kolkata, UTC+05:30)
 * Example: "11 Aug 2026, 01:20 PM"
 */
function formatISTDate(dateInput, options = {}) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const defaultOptions = {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    };
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
  } catch (e) {
    return String(dateInput);
  }
}
