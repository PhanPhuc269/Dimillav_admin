function showToast(message, type = 'info', title = 'Notification', delay = 3000, color='black') {
  // Tạo container nếu chưa có
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-71 end-0 p-3';
      document.body.appendChild(toastContainer);
  }

  // Tạo Toast mới
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center ${type}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-delay="${delay}">
      <div class="d-flex">
        <div class="toast-header">
            <div class="icon-wrapper">
              ${getIcon(type)}
            </div>
        </div>
        <div class="toast-body" style="color: ${color};">
          <strong>${title}</strong><br>${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);

  // Hiển thị Toast
  const newToast = document.getElementById(toastId);
  const toastInstance = new bootstrap.Toast(newToast);
  toastInstance.show();
  //console.log('Toast đã bị ẩn:', toastId);
  // Xóa Toast khi ẩn
  newToast.addEventListener('hidden.bs.toast', () => {
    console.log('Toast đã bị ẩn:', toastId);
      newToast.remove();
  });
}

// Hàm lấy Icon (tùy chọn, nếu muốn thêm icon)
function getIcon(type) {
  const icons = {
      success: '<span class="icon">✔</span>',
      error: '<span class="icon">✖</span>',
      info: '<span class="icon">ℹ</span>',
      warning: '<span class="icon">⚠</span>',
  };
  return icons[type] || '<span class="icon">ℹ</span>';
}
