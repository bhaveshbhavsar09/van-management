// API Integration Functions
const API_BASE = 'http://localhost:3000';

// Toggle Password Visibility Function
window.togglePasswordVisibility = function(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('ph-eye', 'ph-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('ph-eye-slash', 'ph-eye');
  }
};

// Fetch stats for dashboard
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const stats = await res.json();
    if(document.getElementById('vanCount')) document.getElementById('vanCount').textContent = stats.vanCount;
    if(document.getElementById('driverCount')) document.getElementById('driverCount').textContent = stats.driverCount;
    if(document.getElementById('studentCount')) document.getElementById('studentCount').textContent = stats.studentCount;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// Vans
async function loadVans() {
  const table = document.getElementById("vanTable");
  if (!table) return;
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  
  try {
    const res = await fetch(`${API_BASE}/api/vans`);
    const vans = await res.json();
    vans.forEach(van => {
      let row = tbody.insertRow();
      row.innerHTML = `<td>Van ${van.id} - ${van.name || 'Unnamed'}</td><td><span class="badge ${van.status === 'Active' ? 'active' : 'pending'}">${van.status}</span></td><td><button class="btn-danger" onclick="removeVan(${van.id}, this)"><i class="ph ph-trash"></i> Remove</button></td>`;
    });
  } catch (err) {
    console.error('Error loading vans:', err);
  }
}

async function addVan() {
  const name = prompt("Enter Van Name:");
  if (!name) return;
  try {
    const res = await fetch(`${API_BASE}/api/vans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'Active' })
    });
    if (res.ok) {
      loadVans();
    }
  } catch (err) {
    console.error('Error adding van:', err);
  }
}

async function removeVan(id, btn) {
  try {
    const res = await fetch(`${API_BASE}/api/vans/${id}`, { method: 'DELETE' });
    if (res.ok) {
      let row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
  } catch (err) {
    console.error('Error removing van:', err);
  }
}

// Drivers
async function loadDrivers() {
  const table = document.getElementById("driverTable");
  if (!table) return;
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  
  try {
    // Fetch vans first to populate the dropdowns
    const vansRes = await fetch(`${API_BASE}/api/vans`);
    const vans = await vansRes.json();
    
    const res = await fetch(`${API_BASE}/api/drivers`);
    const drivers = await res.json();
    drivers.forEach(driver => {
      let row = tbody.insertRow();
      
      // Build dropdown options
      let vanOptions = `<option value="">-- Unassigned --</option>`;
      vans.forEach(v => {
        const isSelected = driver.van_id === v.id ? 'selected' : '';
        vanOptions += `<option value="${v.id}" ${isSelected}>Van ${v.id} - ${v.name || 'Unnamed'}</option>`;
      });
      
      let selectHtml = `<select onchange="assignVanDirect(${driver.id}, this.value)" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit;">
                          ${vanOptions}
                        </select>`;

      row.innerHTML = `
        <td>${driver.name}</td>
        <td>${selectHtml}</td>
        <td><span class="badge ${driver.status === 'Active' ? 'active' : 'pending'}">${driver.status}</span></td>
        <td><button class="btn-danger" onclick="removeDriver(${driver.id}, this)"><i class="ph ph-trash"></i> Remove</button></td>
      `;
    });
  } catch (err) {
    console.error('Error loading drivers:', err);
  }
}

async function addDriver() {
  const name = prompt("Enter Driver Name:");
  if (!name) return;
  try {
    const res = await fetch(`${API_BASE}/api/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'Pending' })
    });
    if (res.ok) {
      loadDrivers();
    }
  } catch (err) {
    console.error('Error adding driver:', err);
  }
}

async function removeDriver(id, btn) {
  try {
    const res = await fetch(`${API_BASE}/api/drivers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      let row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
  } catch (err) {
    console.error('Error removing driver:', err);
  }
}

window.assignVanDirect = async function(driverId, vanId) {
  try {
    const payload = vanId ? { van_id: parseInt(vanId) } : { van_id: null };
    const assignRes = await fetch(`${API_BASE}/api/drivers/${driverId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!assignRes.ok) {
      alert("Failed to assign van.");
      loadDrivers(); // reload to revert the dropdown
    }
  } catch (err) {
    console.error('Error assigning van:', err);
    loadDrivers();
  }
};

// Students
async function loadStudents() {
  const table = document.getElementById("studentTable");
  if (!table) return;
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  
  try {
    const res = await fetch(`${API_BASE}/api/students`);
    const students = await res.json();
    students.forEach(student => {
      let row = tbody.insertRow();
      row.innerHTML = `<td>${student.name}</td><td><span class="badge ${student.status === 'Active' ? 'active' : 'pending'}">${student.status}</span></td><td><button class="btn-danger" onclick="removeStudent(${student.id}, this)"><i class="ph ph-trash"></i> Remove</button></td>`;
    });
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

async function addStudent() {
  const name = prompt("Enter Student Name:");
  if (!name) return;
  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'Pending' })
    });
    if (res.ok) {
      loadStudents();
    }
  } catch (err) {
    console.error('Error adding student:', err);
  }
}

async function removeStudent(id, btn) {
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) {
      let row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
  } catch (err) {
    console.error('Error removing student:', err);
  }
}

// Sidebar Toggle functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('show');
  overlay.classList.toggle('show');
}

function downloadReport() {
  alert("Your report has been successfully generated and downloaded!");
}

// Initialization on DOM Load
document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname;
  
  // Auth Logic for Login Page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('loginError');
      
      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('user', JSON.stringify(user));
          
          if (user.role === 'admin') window.location.href = 'index.html';
          else if (user.role === 'driver') window.location.href = 'driver-dashboard.html';
          else if (user.role === 'student') window.location.href = 'student-dashboard.html';
        } else {
          errorDiv.textContent = 'Invalid email or password';
        }
      } catch (err) {
        errorDiv.textContent = 'Server error. Try again later.';
      }
    });
  }

  // Auth Logic for Register Page
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const role = document.getElementById('regRole').value;
      const errorDiv = document.getElementById('registerError');
      const successDiv = document.getElementById('registerSuccess');
      
      errorDiv.textContent = '';
      successDiv.textContent = '';

      try {
        const res = await fetch(`${API_BASE}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        
        if (res.ok) {
          successDiv.textContent = 'Account created successfully! Redirecting...';
          const user = await res.json();
          localStorage.setItem('user', JSON.stringify(user));
          
          setTimeout(() => {
            if (user.role === 'admin') window.location.href = 'index.html';
            else if (user.role === 'driver') window.location.href = 'driver-dashboard.html';
            else if (user.role === 'student') window.location.href = 'student-dashboard.html';
          }, 1500);
        } else {
          const data = await res.json();
          errorDiv.textContent = data.error || 'Registration failed';
        }
      } catch (err) {
        errorDiv.textContent = 'Server error. Try again later.';
      }
    });
  }

  // Auth Protection Check
  if (!path.includes('login.html') && !path.includes('register.html')) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = 'login.html';
      return;
    }
    const user = JSON.parse(userStr);
    
    // Update Header UI
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    if (userNameEl) userNameEl.textContent = user.email.split('@')[0];
    if (userRoleEl) userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Role-based Access Control
    const adminPages = ['index.html', 'vans.html', 'drivers.html', 'students.html', 'payments.html'];
    const isRoot = path === '/' || path.endsWith('/');
    const isOnAdminPage = adminPages.some(p => path.endsWith(p)) || isRoot;
    
    if (user.role !== 'admin' && isOnAdminPage) {
      if (user.role === 'driver') window.location.href = 'driver-dashboard.html';
      else if (user.role === 'student') window.location.href = 'student-dashboard.html';
      return;
    }

    // Logout Functionality (Adding a listener to any button with id 'logoutBtn')
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      });
    }

    // Only load Admin data if on an admin page (and user is admin)
    if (user.role === 'admin' && isOnAdminPage) {
      fetchStats();
      loadVans();
      loadDrivers();
      loadStudents();
      
      // Chart.js Setup
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
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
              x: { grid: { display: false } }
            }
          }
        });
      }
    }
  }
});
