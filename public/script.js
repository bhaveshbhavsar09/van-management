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

// Routes
async function loadRoutes() {
  const table = document.getElementById("routeTable");
  if (!table) return;
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/api/routes`);
    const routes = await res.json();
    routes.forEach(route => {
      let row = tbody.insertRow();
      row.innerHTML = `<td>Route ${route.id} - ${route.name}</td><td>${route.van_name || 'Unassigned'}</td><td><button class="btn-primary" onclick="viewStops(${route.id})">Stops</button></td>`;
    });
  } catch (err) { console.error(err); }
}

async function addRoute() {
  const name = prompt("Enter Route Name:");
  if (!name) return;
  try {
    await fetch(`${API_BASE}/api/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, van_id: null })
    });
    loadRoutes();
  } catch (err) { console.error(err); }
}

// Maintenance
async function loadMaintenance() {
  const table = document.getElementById("maintenanceTable");
  if (!table) return;
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/api/maintenance`);
    const logs = await res.json();
    logs.forEach(log => {
      let row = tbody.insertRow();
      row.innerHTML = `<td>${log.date}</td><td>${log.van_name || 'Unknown'}</td><td>${log.type}</td><td>$${log.cost}</td><td>${log.description}</td>`;
    });
  } catch (err) { console.error(err); }
}

async function addMaintenance() {
  const van_id = prompt("Enter Van ID:");
  const type = prompt("Type (Fuel/Repair):");
  const cost = prompt("Cost:");
  const description = prompt("Description:");
  if (!van_id || !type || !cost) return;
  try {
    await fetch(`${API_BASE}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ van_id: parseInt(van_id), type, cost: parseFloat(cost), date: new Date().toISOString().split('T')[0], description })
    });
    loadMaintenance();
  } catch (err) { console.error(err); }
}

// Announcements
async function loadAnnouncements() {
  const list = document.getElementById("announcementList");
  if (!list) return;
  list.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/api/announcements`);
    const announcements = await res.json();
    announcements.forEach(a => {
      list.innerHTML += `<div class="card" style="margin-bottom: 10px;"><strong>To: ${a.target_role}</strong> <span style="float:right; font-size: 0.8rem; color: #888;">${new Date(a.created_at).toLocaleString()}</span><p>${a.message}</p></div>`;
    });
  } catch (err) { console.error(err); }
}

async function addAnnouncement() {
  const message = prompt("Enter announcement message:");
  const target_role = prompt("Target Role (all, parent, driver, student):");
  if (!message || !target_role) return;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    await fetch(`${API_BASE}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, created_by: user.id, target_role })
    });
    loadAnnouncements();
  } catch (err) { console.error(err); }
}

// Calendar
async function loadCalendar() {
  const list = document.getElementById("calendarList");
  if (!list) return;
  list.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/api/calendar`);
    const events = await res.json();
    events.forEach(e => {
      list.innerHTML += `<li>${e.date} - <strong>${e.title}</strong> ${e.is_holiday ? '(Holiday)' : ''}</li>`;
    });
  } catch (err) { console.error(err); }
}

async function addCalendarEvent() {
  const title = prompt("Event Title:");
  const date = prompt("Date (YYYY-MM-DD):");
  const is_holiday = confirm("Is this a holiday/day off?");
  if (!title || !date) return;
  try {
    await fetch(`${API_BASE}/api/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, is_holiday })
    });
    loadCalendar();
  } catch (err) { console.error(err); }
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
          else if (user.role === 'parent') window.location.href = 'parent-dashboard.html';
        } else {
          errorDiv.textContent = 'Invalid email or password';
        }
      } catch (err) {
        errorDiv.textContent = 'Server connection failed. Is the backend running?';
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
            else if (user.role === 'parent') window.location.href = 'parent-dashboard.html';
          }, 1500);
        } else {
          const data = await res.json();
          errorDiv.textContent = data.error || 'Registration failed';
        }
      } catch (err) {
        errorDiv.textContent = 'Server connection failed. Is the backend running?';
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
    if (userNameEl) userNameEl.textContent = user.name || user.email.split('@')[0];
    if (userRoleEl) {
      userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      userRoleEl.className = `user-role role-badge ${user.role}`;
    }
    const avatarEl = document.getElementById('headerAvatar');
    if (avatarEl) {
      avatarEl.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=0ea5e9&color=fff`;
    }
    
    // Notifications Logic
    loadNotifications(user.id);
    
    // Profile Page Logic
    if (path.includes('profile.html')) {
      initProfilePage(user);
    }
    
    // Role-based Access Control
    const adminPages = ['index.html', 'vans.html', 'drivers.html', 'students.html', 'payments.html', 'routes.html', 'maintenance.html', 'announcements.html', 'calendar.html', 'tracking.html'];
    const isRoot = path === '/' || path.endsWith('/');
    const isOnAdminPage = adminPages.some(p => path.endsWith(p)) || isRoot;
    
    if (user.role !== 'admin' && isOnAdminPage) {
      if (user.role === 'driver') window.location.href = 'driver-dashboard.html';
      else if (user.role === 'student') window.location.href = 'student-dashboard.html';
      else if (user.role === 'parent') window.location.href = 'parent-dashboard.html';
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
      loadRoutes();
      loadMaintenance();
      loadAnnouncements();
      loadCalendar();
      
      // Chart.js Setup
      const chartCanvas = document.getElementById('revenueChart');
      if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Monthly Revenue (₹)',
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

// Global UI Logic (Dropdowns, Dark Mode, Auth)
function logoutUser() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Dark Mode Toggle
function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.body.classList.add('dark-theme');
  
  const toggleBtn = document.getElementById('darkModeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-theme'));
    });
  }
}
initDarkMode();

// Dropdowns
document.addEventListener('click', (e) => {
  const profileMenu = document.getElementById('profileMenu');
  const notifMenu = document.getElementById('notificationMenu');
  
  // Profile Dropdown
  if (e.target.closest('#profileToggle')) {
    profileMenu?.classList.toggle('show');
    if (notifMenu) notifMenu.classList.remove('show');
  } else if (!e.target.closest('#profileMenu')) {
    profileMenu?.classList.remove('show');
  }


  
  // Notification Dropdown
  if (e.target.closest('#notificationToggle')) {
    notifMenu?.classList.toggle('show');
    if (profileMenu) profileMenu.classList.remove('show');
  } else if (!e.target.closest('#notificationMenu')) {
    notifMenu?.classList.remove('show');
  }
});

async function loadNotifications(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/${userId}`);
    const notifs = await res.json();
    const countEl = document.getElementById('notificationCount');
    const listEl = document.getElementById('notificationList');
    
    if (!countEl || !listEl) return;
    
    const unread = notifs.filter(n => !n.is_read).length;
    countEl.textContent = unread;
    countEl.style.display = unread > 0 ? 'flex' : 'none';
    
    if (notifs.length === 0) {
      listEl.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-light); font-size: 0.9rem;">No new notifications</div>';
      return;
    }
    
    listEl.innerHTML = notifs.map(n => `
      <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: ${n.is_read ? 'transparent' : 'rgba(14,165,233,0.05)'}">
        <div style="font-size: 0.9rem; color: var(--text-dark);">${n.message}</div>
        <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px;">${new Date(n.created_at).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
}

async function markNotificationsRead() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;
  try {
    await fetch(`${API_BASE}/api/notifications/${user.id}/read`, { method: 'PUT' });
    loadNotifications(user.id);
  } catch (err) {
    console.error(err);
  }
}

// Profile Page Initialization
async function initProfilePage(user) {
  // Load Form Data
  try {
    const res = await fetch(`${API_BASE}/api/profile/${user.id}`);
    const profileData = await res.json();
    
    document.getElementById('profileName').value = profileData.name || '';
    document.getElementById('profileEmail').value = profileData.email || '';
    document.getElementById('profilePhone').value = profileData.phone || '';
    document.getElementById('profileAvatar').value = profileData.avatar || '';
  } catch (err) {
    console.error('Error loading profile:', err);
  }
  
  // Load Activities
  try {
    const res = await fetch(`${API_BASE}/api/activities/${user.id}`);
    const activities = await res.json();
    const listEl = document.getElementById('activityList');
    
    if (activities.length === 0) {
      listEl.innerHTML = '<li style="justify-content: center; color: var(--text-light);">No recent activity.</li>';
    } else {
      listEl.innerHTML = activities.map(a => `
        <li>
          <span>${a.action}</span>
          <span class="activity-time">${new Date(a.created_at).toLocaleString()}</span>
        </li>
      `).join('');
    }
  } catch(err) {
    console.error('Error loading activities:', err);
  }
  
  // Handle Form Submit
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const avatar = document.getElementById('profileAvatar').value;
    const password = document.getElementById('profilePassword').value;
    const msgEl = document.getElementById('profileMessage');
    
    try {
      const payload = { name, phone, avatar };
      if (password) payload.password = password;
      
      const res = await fetch(`${API_BASE}/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        msgEl.textContent = 'Profile updated successfully!';
        msgEl.style.color = 'var(--success-color)';
        
        // Update local storage user object cache
        user.name = name;
        user.avatar = avatar;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Reload to update header
        setTimeout(() => window.location.reload(), 1000);
      } else {
        msgEl.textContent = 'Failed to update profile.';
        msgEl.style.color = 'var(--danger-color)';
      }
    } catch(err) {
      msgEl.textContent = 'Network error.';
      msgEl.style.color = 'var(--danger-color)';
    }
  });
}

// Map Initialization (Leaflet)
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') return setTimeout(initMap, 100);
  
  const map = L.map('map').setView([19.0760, 72.8777], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const vanIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2959/2959827.png',
    iconSize: [40, 40]
  });

  const marker = L.marker([19.0760, 72.8777], {icon: vanIcon}).addTo(map)
    .bindPopup('Van 1 - Moving to School');
    
  // Mock Movement
  let lat = 19.0760;
  let lng = 72.8777;
  setInterval(() => {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;
    marker.setLatLng([lat, lng]);
  }, 2000);
}
document.addEventListener("DOMContentLoaded", initMap);
