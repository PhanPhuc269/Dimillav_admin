
const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');
const topCountInput = document.getElementById('topCount');

yearSelect.addEventListener('change', updateCharts);
monthSelect.addEventListener('change', updateCharts);
topCountInput.addEventListener('change', updateCharts);

function updateCharts() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const topCount = topCountInput.value;

    // Cập nhật URL mà không tải lại trang
    const url = `/report/topProducts?year=${year}&month=${month}&topCount=${topCount}`;
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
            // Cập nhật các biểu đồ
            updateChart(data.annualTopProducts, 'annualTopProductsChart', 'Top sản phẩm theo năm');
            updateChart(data.monthlyTopProducts, 'monthlyTopProductsChart', 'Top sản phẩm theo tháng');
            updateChart(data.weeklyTopProducts, 'weeklyTopProductsChart', 'Top sản phẩm theo tuần');
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu:', error);
        });
}

function updateChart(productData, chartId, title) {
    const labels = productData.map(item => item.productName);
    const revenueData = productData.map(item => item.revenue);

    const ctx = document.getElementById(chartId).getContext('2d');

    if (window[chartId] && typeof window[chartId].destroy === 'function') {
        window[chartId].destroy();
    }

    window[chartId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: revenueData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { autoSkip: true, maxTicksLimit: 10 } },
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                },
            }
        }
    });
}

// Gọi ngay để hiển thị khi tải trang
updateCharts();
