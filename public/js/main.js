// Auto dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});

// Confirmation before delete
function confirmDelete(message) {
  return confirm(message || 'Apakah Anda yakin ingin menghapus data ini?');
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    const response = await fetch(`/notifikasi/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      location.reload();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Print function
function printPage() {
  window.print();
}

// Export to CSV (simple implementation)
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  
  for (let row of rows) {
    let cols = row.querySelectorAll('td, th');
    let csvRow = [];
    for (let col of cols) {
      csvRow.push(col.innerText);
    }
    csv.push(csvRow.join(','));
  }
  
  const csvString = csv.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'export.csv';
  link.click();
}
