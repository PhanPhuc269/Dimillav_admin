
const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');

yearSelect.addEventListener('change', updateCharts);
monthSelect.addEventListener('change', updateCharts);

function updateCharts() {
    const year = yearSelect.value;
    const month = monthSelect.value;

    // Cập nhật URL mà không tải lại trang
    const url = `/report/sales?year=${year}&month=${month}`;
    window.history.pushState({}, '', url);

    // Gửi yêu cầu AJAX để lấy dữ liệu
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
    .then(response => response.json())
    .then(data => {
        // Cập nhật cả hai đồ thị
        updateChart(data.monthlySales, 'monthlySalesChart', 'Doanh số theo tháng');
        updateChart(data.dailySales, 'dailySalesChart', 'Doanh số theo ngày');
    })
    .catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
    });
}

function updateChart(salesData, chartId, title) {
    const labels = chartId === 'monthlySalesChart'
        ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
        : [...Array(31).keys()].map(i => `Ngày ${i + 1}`);

    const ctx = document.getElementById(chartId).getContext('2d');

    // Kiểm tra và hủy đồ thị cũ nếu tồn tại
    if (window[chartId] && typeof window[chartId].destroy === 'function') {
        window[chartId].destroy();
    }

    // Tạo mới đồ thị
    window[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh số (Sản phẩm)',
                data: salesData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw || 0;
                            return `Doanh số: ${value.toLocaleString()} Sản phẩm`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Doanh số (Sản phẩm)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load dữ liệu ban đầu
window.onload = function() {
    updateCharts();
};
