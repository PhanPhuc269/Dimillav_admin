// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('resend_email_form');
//     if (form) {
//         form.addEventListener('submit', function(event) {
//             event.preventDefault(); // Ngăn chặn form gửi đi

//         });
//     }
// });
const email = document.getElementById('email').value;
setInterval(async () => {
    const response = await fetch('/auth/check-confirmation', {
        credentials: 'include'
    });
    const data = await response.json();
    if (data.isConfirmed) {
      window.location.href = '/';
    }
  }, 5000); // Kiểm tra mỗi 5 giây
