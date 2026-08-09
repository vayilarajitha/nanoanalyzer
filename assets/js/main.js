/**
 * NanoAnalyzer Universal JavaScript Controller
 * Core interactions, floating AI chatbot engine, AJAX CRUD handlers & notifications
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
      <div>${message}</div>
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

    appendChatMessage(text, 'user');
    chatInput.value = '';

    // Show typing indicator
    const typingElem = showTypingIndicator();

    // AJAX to chatbot_handler.php
    fetch('ajax/chatbot_handler.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message: text })
    })
      .then(res => res.json())
      .then(data => {
        typingElem.remove();
        if (data.status === 'success') {
          appendChatMessage(data.response, 'bot');
        } else {
          appendChatMessage('Forgive me, I encountered an issue processing your biomedical query.', 'bot');
        }
      })
      .catch(err => {
        typingElem.remove();
        appendChatMessage('Network connection error. Please try again.', 'bot');
      });
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

// Dataset CRUD Helper Functions
function deleteDataset(id) {
  if (!confirm('Are you sure you want to delete this dataset entry?')) return;

  fetch('ajax/dataset_crud.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'delete', id: id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showToast(data.message, 'success');
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    });
}

// Experiment CRUD Helper Functions
function deleteExperiment(id) {
  if (!confirm('Are you sure you want to remove this lab experiment entry?')) return;

  fetch('ajax/experiment_crud.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'delete', id: id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showToast(data.message, 'success');
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast(data.message, 'error');
      }
    });
}

// Print Report PDF helper
function generatePDFReport() {
  window.print();
}
