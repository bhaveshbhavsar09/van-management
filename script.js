// Sidebar Toggle functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('show');
  overlay.classList.toggle('show');
}

// Chart.js Initialization for Dashboard
document.addEventListener("DOMContentLoaded", function() {
  const chartCanvas = document.getElementById('revenueChart');
  if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: [1200, 1900, 1500, 2200, 2800, 2600],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e2e8f0'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
});

// Existing Table Functions with updated markup
function addVan() {
  let table = document.getElementById("vanTable").getElementsByTagName('tbody')[0];
  let row = table.insertRow();
  row.innerHTML = `<td>Van ${table.rows.length}</td><td><span class="badge active">Active</span></td><td><button class="btn-danger" onclick="removeRow(this)"><i class="ph ph-trash"></i> Remove</button></td>`;
}

function addDriver() {
  let table = document.getElementById("driverTable").getElementsByTagName('tbody')[0];
  let row = table.insertRow();
  row.innerHTML = `<td>Driver ${table.rows.length}</td><td><span class="badge pending">Pending</span></td><td><button class="btn-danger" onclick="removeRow(this)"><i class="ph ph-trash"></i> Remove</button></td>`;
}

function addStudent() {
  let table = document.getElementById("studentTable").getElementsByTagName('tbody')[0];
  let row = table.insertRow();
  row.innerHTML = `<td>Student ${table.rows.length}</td><td><span class="badge pending">Pending</span></td><td><button class="btn-danger" onclick="removeRow(this)"><i class="ph ph-trash"></i> Remove</button></td>`;
}

function removeRow(btn) {
  let row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}
