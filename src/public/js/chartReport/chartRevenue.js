
const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');

yearSelect.addEventListener('change', updateCharts);
monthSelect.addEventListener('change', updateCharts);

function updateCharts() {
const year = yearSelect.value;
const month = monthSelect.value;

// Cập nhật URL mà không tải lại trang
const url = `/report/revenue?year=${year}&month=${month}`;
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
    // Cập nhật cả ba đồ thị
     
    updateChart(data.monthlyRevenue, 'monthlyRevenueChart', 'Doanh thu theo tháng');
    updateChart(data.dailyRevenue, 'dailyRevenueChart', 'Doanh thu theo ngày');
    updateChart(data.weeklyRevenue, 'weeklyRevenueChart', 'Doanh thu theo tuần');
})
.catch(error => {
    console.error('Lỗi khi tải dữ liệu:', error);
});
}

function updateChart(revenueData, chartId, title) {
//console.log('id',chartId)
const labels = chartId === 'monthlyRevenueChart'
? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
: chartId === 'weeklyRevenueChart'
    ? revenueData.map((_, i) => `Tuần ${i + 1}`)
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
        label: 'Doanh thu (VND)',
        data: revenueData.map(item => item.revenue || 0),
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
                label: function (context) {
                    const value = context.raw || 0;
                    return `Doanh thu: ${value.toLocaleString()} VND`;
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
                text: 'Doanh thu (VND)'
            },
            ticks: {
                callback: function (value) {
                    return value.toLocaleString();
                }
            }
        }
    }
}
});
}

// Load dữ liệu ban đầu
window.onload = function () {
updateCharts();
};

