
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const page = path.split("/")[1];
    const subpage = path.split("/")[2];

    const menuItems = {
        '': 'dashboard',
        'account': 'account',
        'product': 'products',
        'report': 'report',
        'inventory': 'inventory',
        'order': 'orders',

    };

    const subMenuItems = {
        'product': {
            'list': 'list-products',
            'add': 'add-product',
            'edit': 'edit-product',
        },
        'order': {
            'list': 'orders',
            'detail': 'order-detail',
        },
        'report': {
            'sales': 'sales-report',
            'revenue': 'revenue-report',
        },
    };

    if (menuItems[page]) {
        document.getElementById(menuItems[page]).classList.add('active');
        document.getElementById(menuItems[page]).classList.add('show-special');
        
        if (subMenuItems[page] && subMenuItems[page][subpage]) {
            document.getElementById(subMenuItems[page][subpage]).classList.add('active-sub');
        }
    }

    // Lấy số lượng tin nhắn chưa đọc khi tải trang
    fetch('/notify/unread-count')
    .then(response => response.json())
    .then(data => {
        const unreadMessageCount = document.getElementById('unreadMessageCount');
        if (data.unreadCount === 0) {
            unreadMessageCount.style.display = 'none';
        } else {
            unreadMessageCount.textContent = data.unreadCount;
        }
    })
    .catch(error => console.error('Error fetching unread message count:', error));


    // Lắng nghe sự kiện click vào dropdown tin nhắn
    const messageDropdown = document.getElementById('messageDropdown');
    messageDropdown.addEventListener('click', function () {
        fetchMessages();
    });
    // Hàm để lấy và hiển thị tin nhắn
    function fetchMessages() {
        fetch('/notify/messages')
            .then(response => response.json())
            .then(data => {
                const messageDropdownMenu = document.getElementById('messageDropdownMenu');
                messageDropdownMenu.innerHTML = ''; // Xóa nội dung cũ
                
                if (data.messagesNotification.length === 0) {
                    const noMessageElement = document.createElement('a');
                    noMessageElement.href = '#';
                    noMessageElement.classList.add('dropdown-item', 'text-center');
                    noMessageElement.textContent = 'No new messages';
                    messageDropdownMenu.appendChild(noMessageElement);
                    return;
                }

                data.messagesNotification.forEach(message => {
                    const messageElement = document.createElement('a');
                    messageElement.href = '#';
                    messageElement.classList.add('dropdown-item');
                    messageElement.innerHTML = `
                        <a href="/chat/${message.sender}" class="d-flex align-items-center">
                            <img class="rounded-circle" src="${message.avatar}" alt="" style="width: 40px; height: 40px;">
                            <div class="ms-2">
                                <h6 class="fw-normal mb-0">${message.name} send you ${message.quantity} messages</h6>
                                <small>${formatTime(message.updatedAt)}</small>
                            </div>
                        </a>
                    `;
                    messageDropdownMenu.appendChild(messageElement);
                    messageDropdownMenu.appendChild(document.createElement('hr')).classList.add('dropdown-divider');
                });

                const seeAllMessages = document.createElement('a');
                seeAllMessages.href = '#';
                seeAllMessages.classList.add('dropdown-item', 'text-center');
                seeAllMessages.textContent = 'See all messages';
                messageDropdownMenu.appendChild(seeAllMessages);
            })
            .catch(error => console.error('Error fetching messages:', error));
    }  
    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
    
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return `${time} | ${day}/${month}`;
        }
    } 
  // Khóa public VAPID (thay YOUR_PUBLIC_KEY bằng khóa VAPID của bạn)
  const publicVapidKey = 'BBxXgcHvdEC7568GrE9DokgEKHWvz1GtxiwEdCfhk7LxBCSLSr7lYDynmqYgUFXUKSdTVeDCTSu2MvpJ4rdvw5w';

  // Hàm chuyển đổi Base64 VAPID Key sang Uint8Array
  function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  // Đăng ký Service Worker và Push Notification
  if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker và Push Notifications được hỗ trợ.');

      // Đăng ký Service Worker
      navigator.serviceWorker.register('/js/sw.js')
          .then((registration) => {
              console.log('Service Worker đã được đăng ký:', registration);

              // Đăng ký Push Notification
              return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
              });
          })
          .then(async (subscription) => {
              console.log('Push Subscription đã được tạo:', subscription);

              // Gửi subscription lên server
              const response = await fetch('/notify/subscribe', {
                  method: 'POST',
                  body: JSON.stringify(subscription),
                  headers: {
                      'Content-Type': 'application/json',
                  },
              });

              if (response.ok) {
                  console.log('Subscription đã được gửi lên server thành công!');
              } else {
                  console.error('Lỗi khi gửi subscription lên server:', response.statusText);
              }
          })
          .catch((error) => {
              console.error('Lỗi khi đăng ký Service Worker hoặc Push Notifications:', error);
          });
  } else {
      console.error('Service Worker hoặc Push Notifications không được hỗ trợ trên trình duyệt này.');
  }
});

(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    // Worldwide Sales Chart
    var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    var myChart1 = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
            datasets: [{
                    label: "USA",
                    data: [15, 30, 55, 65, 60, 80, 95],
                    backgroundColor: "rgba(235, 22, 22, .7)"
                },
                {
                    label: "UK",
                    data: [8, 35, 40, 60, 70, 55, 75],
                    backgroundColor: "rgba(235, 22, 22, .5)"
                },
                {
                    label: "AU",
                    data: [12, 25, 45, 55, 65, 70, 60],
                    backgroundColor: "rgba(235, 22, 22, .3)"
                }
            ]
            },
        options: {
            responsive: true
        }
    });


    // Salse & Revenue Chart
    var ctx2 = $("#salse-revenue").get(0).getContext("2d");
    var myChart2 = new Chart(ctx2, {
        type: "line",
        data: {
            labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
            datasets: [{
                    label: "Salse",
                    data: [15, 30, 55, 45, 70, 65, 85],
                    backgroundColor: "rgba(235, 22, 22, .7)",
                    fill: true
                },
                {
                    label: "Revenue",
                    data: [99, 135, 170, 130, 190, 180, 270],
                    backgroundColor: "rgba(235, 22, 22, .5)",
                    fill: true
                }
            ]
            },
        options: {
            responsive: true
        }
    });
    


    // Single Line Chart
    var ctx3 = $("#line-chart").get(0).getContext("2d");
    var myChart3 = new Chart(ctx3, {
        type: "line",
        data: {
            labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            datasets: [{
                label: "Salse",
                fill: false,
                backgroundColor: "rgba(235, 22, 22, .7)",
                data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Single Bar Chart
    var ctx4 = $("#bar-chart").get(0).getContext("2d");
    var myChart4 = new Chart(ctx4, {
        type: "bar",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Pie Chart
    var ctx5 = $("#pie-chart").get(0).getContext("2d");
    var myChart5 = new Chart(ctx5, {
        type: "pie",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Doughnut Chart
    var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
    var myChart6 = new Chart(ctx6, {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });

    
})(jQuery);
function formatCurrencyVND(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}