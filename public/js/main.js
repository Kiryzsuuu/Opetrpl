// Auto dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  // Global confirmation modal handler
  const confirmModalEl = document.getElementById('confirmModal');
  const confirmModalTitleEl = document.getElementById('confirmModalTitle');
  const confirmModalMessageEl = document.getElementById('confirmModalMessage');
  const confirmModalOkBtn = document.getElementById('confirmModalOk');
  const confirmModal = confirmModalEl ? new bootstrap.Modal(confirmModalEl) : null;
  let pendingConfirmAction = null;

  function openConfirmModal(options) {
    if (!confirmModal) {
      // Fallback (shouldn't happen on pages using navbar)
      const ok = window.confirm(options.message || 'Apakah Anda yakin?');
      if (ok && typeof options.onConfirm === 'function') options.onConfirm();
      return;
    }

    confirmModalTitleEl.textContent = options.title || 'Konfirmasi';
    confirmModalMessageEl.textContent = options.message || 'Apakah Anda yakin?';
    confirmModalOkBtn.textContent = options.confirmText || 'Ya, Lanjutkan';
    confirmModalOkBtn.className = `btn ${options.confirmBtnClass || 'btn-primary'}`;
    pendingConfirmAction = typeof options.onConfirm === 'function' ? options.onConfirm : null;
    confirmModal.show();
  }

  if (confirmModalOkBtn) {
    confirmModalOkBtn.addEventListener('click', function() {
      const action = pendingConfirmAction;
      pendingConfirmAction = null;
      if (confirmModal) confirmModal.hide();
      if (action) action();
    });
  }

  // Intercept form submits that request confirmation
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const message = form.getAttribute('data-confirm');
    if (!message) return;

    e.preventDefault();
    openConfirmModal({
      message,
      confirmBtnClass: form.getAttribute('data-confirm-btn-class') || 'btn-primary',
      confirmText: form.getAttribute('data-confirm-ok-text') || 'Ya, Lanjutkan',
      onConfirm: () => form.submit()
    });
  });

  // Intercept link clicks that request confirmation
  document.addEventListener('click', function(e) {
    const link = e.target.closest && e.target.closest('a[data-confirm]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    openConfirmModal({
      message: link.getAttribute('data-confirm') || 'Apakah Anda yakin? ',
      confirmBtnClass: link.getAttribute('data-confirm-btn-class') || 'btn-primary',
      confirmText: link.getAttribute('data-confirm-ok-text') || 'Ya, Lanjutkan',
      onConfirm: () => {
        window.location.href = href;
      }
    });
  });
});

// Client-side Bootstrap alert helper (replaces window.alert)
window.showClientAlert = function(message, type) {
  const alertType = type || 'danger';
  const container = document.querySelector('main') || document.body;

  let wrapper = container.querySelector('[data-client-alert-host]');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.setAttribute('data-client-alert-host', 'true');
    wrapper.className = 'mb-3';
    container.prepend(wrapper);
  }

  wrapper.innerHTML = `
    <div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
      ${String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
};

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
