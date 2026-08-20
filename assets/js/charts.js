/**
 * NanoAnalyzer Live Chart.js Data Visualizations
 * High-Contrast Accessible Chart Formatting driven by ajax/get_chart_data.php
 */

let uptakeSizeChartInstance = null;
let materialDistChartInstance = null;
let toxicityChartInstance = null;
let cellLineChartInstance = null;

document.addEventListener('DOMContentLoaded', function () {
  fetchChartData();
});

function fetchChartData() {
  fetch('ajax/get_chart_data.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        renderUptakeSizeChart(data.uptake_vs_size);
        renderMaterialDistChart(data.material_distribution);
        renderToxicityChart(data.toxicity_by_material);
        renderCellLineChart(data.cell_line_uptake);
      }
    })
    .catch(err => console.error('Chart Data Loading Error:', err));
}

function handleEmptyChart(ctx, message) {
  if (!ctx) return;
  const container = ctx.parentElement;
  if (!container) return;

  ctx.style.display = 'none';
  let emptyMsg = container.querySelector('.chart-empty-msg');
  if (!emptyMsg) {
    emptyMsg = document.createElement('div');
    emptyMsg.className = 'chart-empty-msg text-muted d-flex align-items-center justify-content-center h-100';
    container.appendChild(emptyMsg);
  }
  emptyMsg.textContent = message;
  emptyMsg.style.display = 'flex';
}

function handleNonEmptyChart(ctx) {
  if (!ctx) return;
  const container = ctx.parentElement;
  if (container) {
    const emptyMsg = container.querySelector('.chart-empty-msg');
    if (emptyMsg) {
      emptyMsg.style.display = 'none';
    }
  }
  ctx.style.display = 'block';
}

function handleChartNote(ctx, message) {
  if (!ctx) return;
  const container = ctx.parentElement;
  if (!container) return;
  let note = container.querySelector('.chart-info-note');
  if (message) {
    if (!note) {
      note = document.createElement('div');
      note.className = 'chart-info-note text-cyan small text-center mt-2 opacity-75';
      note.style.fontSize = '0.8rem';
      container.appendChild(note);
    }
    note.innerHTML = `<i class="bi bi-info-circle me-1"></i> ${message}`;
    note.style.display = 'block';
  } else if (note) {
    note.style.display = 'none';
  }
}

// 1. Particle Size vs Cellular Uptake Efficiency (Scatter / Line Curve)
function renderUptakeSizeChart(chartData) {
  const ctx = document.getElementById('uptakeSizeChart');
  if (!ctx) return;

  if (uptakeSizeChartInstance) {
    uptakeSizeChartInstance.destroy();
    uptakeSizeChartInstance = null;
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    handleChartNote(ctx, null);
    handleEmptyChart(ctx, 'No analysis data available');
    return;
  }

  handleNonEmptyChart(ctx);

  const isSinglePoint = (chartData.length === 1);
  if (isSinglePoint) {
    handleChartNote(ctx, 'Only one analysis point available');
  } else {
    handleChartNote(ctx, null);
  }

  uptakeSizeChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(d => `${d.size_nm} nm`),
      datasets: [{
        label: 'Cellular Uptake Efficiency (%)',
        data: chartData.map(d => d.uptake),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 3,
        tension: 0.3,
        fill: !isSinglePoint,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#06b6d4',
        pointBorderWidth: 2,
        pointRadius: isSinglePoint ? 9 : 6,
        pointHoverRadius: isSinglePoint ? 12 : 9
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e2e8f0', font: { family: 'Inter', weight: '600' } } },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              return `Cellular Uptake: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#cbd5e1', font: { weight: '500' } } },
        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#cbd5e1', font: { weight: '500' } }, min: 0, max: 100 }
      }
    }
  });
}

// 2. Nanoparticle Core Material Distribution (Doughnut Chart)
function renderMaterialDistChart(chartData) {
  const ctx = document.getElementById('materialDistChart');
  if (!ctx) return;

  if (materialDistChartInstance) {
    materialDistChartInstance.destroy();
    materialDistChartInstance = null;
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    handleEmptyChart(ctx, 'No data available');
    return;
  }

  handleNonEmptyChart(ctx);

  materialDistChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.map(d => d.material),
      datasets: [{
        data: chartData.map(d => d.count),
        backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { family: 'Inter', weight: '500' } } }
      },
      cutout: '70%'
    }
  });
}

// 3. Cytotoxicity Score by Nanoparticle Material (Bar Chart)
function renderToxicityChart(chartData) {
  const ctx = document.getElementById('toxicityChart');
  if (!ctx) return;

  if (toxicityChartInstance) {
    toxicityChartInstance.destroy();
    toxicityChartInstance = null;
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    handleEmptyChart(ctx, 'No data available');
    return;
  }

  handleNonEmptyChart(ctx);

  toxicityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map(d => d.material),
      datasets: [{
        label: 'Cytotoxicity Index (0-100)',
        data: chartData.map(d => d.avg_toxicity),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e2e8f0', font: { weight: '600' } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { weight: '500' } } },
        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#cbd5e1', font: { weight: '500' } } }
      }
    }
  });
}

// 4. Uptake Efficiency by Target Cell Line (Radar / Bar Chart)
function renderCellLineChart(chartData) {
  const ctx = document.getElementById('cellLineChart');
  if (!ctx) return;

  if (cellLineChartInstance) {
    cellLineChartInstance.destroy();
    cellLineChartInstance = null;
  }

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    handleEmptyChart(ctx, 'No data available');
    return;
  }

  handleNonEmptyChart(ctx);

  cellLineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map(d => d.cell_line),
      datasets: [{
        label: 'Mean Internalisation Rate (%)',
        data: chartData.map(d => d.avg_uptake),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e2e8f0', font: { weight: '600' } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { weight: '500' } } },
        y: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#cbd5e1', font: { weight: '500' } }, min: 0, max: 100 }
      }
    }
  });
}
