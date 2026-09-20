const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'public', 'vans.html');
let template = fs.readFileSync(templatePath, 'utf-8');

// Remove active class from vans link
template = template.replace('href="vans.html" class="active"', 'href="vans.html"');

const pages = [
  {
    file: 'routes.html',
    title: 'Routes',
    tableHeader: '<tr><th>Route</th><th>Van</th><th>Actions</th></tr>',
    tableId: 'routeTable',
    addBtn: '<button class="btn-primary" onclick="addRoute()"><i class="ph ph-plus"></i> Add Route</button>'
  },
  {
    file: 'maintenance.html',
    title: 'Maintenance Logs',
    tableHeader: '<tr><th>Date</th><th>Van</th><th>Type</th><th>Cost</th><th>Description</th></tr>',
    tableId: 'maintenanceTable',
    addBtn: '<button class="btn-primary" onclick="addMaintenance()"><i class="ph ph-plus"></i> Add Log</button>'
  },
  {
    file: 'announcements.html',
    title: 'Announcements',
    content: '<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom: 20px;"><h2 class="card-title">Recent Announcements</h2><button class="btn-primary" onclick="addAnnouncement()"><i class="ph ph-plus"></i> New Announcement</button></div><div id="announcementList"></div></div>'
  },
  {
    file: 'calendar.html',
    title: 'Calendar & Leaves',
    content: '<div class="card"><div style="display:flex; justify-content:space-between; margin-bottom: 20px;"><h2 class="card-title">Holidays / Events</h2><button class="btn-primary" onclick="addCalendarEvent()"><i class="ph ph-plus"></i> Add Event</button></div><ul id="calendarList" style="list-style: none; padding: 0;"></ul></div>'
  },
  {
    file: 'tracking.html',
    title: 'Live Tracking',
    content: '<div class="card" style="padding: 0;"><div id="map" style="height: 500px; width: 100%; border-radius: 12px;"></div></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />'
  },
  {
    file: 'parent-dashboard.html',
    title: 'Parent Portal',
    content: '<div class="card"><h2 class="card-title">My Children</h2><div id="childrenList">Loading...</div></div><div class="card" style="margin-top: 20px;"><h2 class="card-title">Live Tracking</h2><div id="map" style="height: 400px; width: 100%; border-radius: 12px;"></div></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />'
  }
];

pages.forEach(p => {
  let content = template;
  // Replace title
  content = content.replace(/<title>.*<\/title>/, `<title>${p.title} - Van Business</title>`);
  // Add active class
  content = content.replace(`href="${p.file}"`, `href="${p.file}" class="active"`);
  
  // Replace main content
  let mainContentHtml = '';
  if (p.content) {
    mainContentHtml = `<div class="content-wrapper"><div class="section-header"><div><h1 class="page-title">${p.title}</h1></div></div>${p.content}</div>`;
  } else {
    mainContentHtml = `<div class="content-wrapper">
      <div class="section-header">
        <div><h1 class="page-title">Manage ${p.title}</h1></div>
        ${p.addBtn}
      </div>
      <div class="card">
        <div class="table-container">
          <table class="data-table" id="${p.tableId}">
            <thead>${p.tableHeader}</thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  }
  
  // Replace everything between <div class="content-wrapper"> and </main>
  content = content.replace(/<div class="content-wrapper">[\s\S]*<\/main>/, `${mainContentHtml}\n  </main>`);
  
  fs.writeFileSync(path.join(__dirname, 'public', p.file), content);
  console.log(`Created ${p.file}`);
});
