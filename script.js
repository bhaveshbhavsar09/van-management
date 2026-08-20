function addVan() {
  let table = document.getElementById("vanTable");
  let row = table.insertRow();
  row.innerHTML = `<td>Van ${table.rows.length}</td><td>Active</td><td><button onclick="removeRow(this)">Remove</button></td>`;
}

function addDriver() {
  let table = document.getElementById("driverTable");
  let row = table.insertRow();
  row.innerHTML = `<td>Driver ${table.rows.length}</td><td>Pending</td><td><button onclick="removeRow(this)">Remove</button></td>`;
}

function addStudent() {
  let table = document.getElementById("studentTable");
  let row = table.insertRow();
  row.innerHTML = `<td>Student ${table.rows.length}</td><td>Pending</td><td><button onclick="removeRow(this)">Remove</button></td>`;
}

function removeRow(btn) {
  let row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
}
