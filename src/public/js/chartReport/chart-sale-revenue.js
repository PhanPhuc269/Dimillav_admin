// Select the canvas element
const combinedCanvas = document.getElementById('combinedChart').getContext('2d');

// Static data for Sales and Revenue
const currentYear = new Date().getFullYear();
// Dữ liệu từ biến annualSummaryReport được truyền từ server
const annualSummaryReport = JSON.parse(document.getElementById('annualSummaryData').textContent); // Parse data from hidden input or tag

// Tách dữ liệu từ annualSummaryReport
const years = annualSummaryReport.map(item => item.year); // Lấy danh sách các năm
const salesData = annualSummaryReport.map(item => item.sales); // Lấy dữ liệu sales
const revenueData = annualSummaryReport.map(item => item.revenue); // Lấy dữ liệu revenue
console.log('dt: ',annualSummaryReport)
// Create Combined Chart
new Chart(combinedCanvas, {
    type: 'line', // Line chart
    data: {
        labels: years,
        datasets: [
            {
                label: 'Sales',
                data: salesData,
                backgroundColor: 'rgba(235, 22, 22, 0.7)', // Stylish red fill
                borderColor: 'rgba(235, 22, 22, 1)', // Border color
                borderWidth: 2,
                fill: true // Fill below the line
            },
            {
                label: 'Revenue',
                data: revenueData,
                backgroundColor: 'rgba(235, 22, 22, 0.5)', // Lighter red fill
                borderColor: 'rgba(235, 22, 22, 0.8)', // Border color
                borderWidth: 2,
                fill: true // Fill below the line
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top', // Position of legend
                labels: {
                    font: {
                        size: 14 // Font size for legend
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw || 0;
                        if (context.dataset.label === 'Revenue') {
                            return `Revenue: ${value.toLocaleString()} VND`;
                        } else {
                            return `Sales: ${value} units`;
                        }
                    }
                }
            },
            title: {
                display: true,
                text: 'Sales and Revenue Chart',
                font: {
                    size: 18 // Title font size
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Values',
                    font: {
                        size: 14
                    }
                },
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString(); // Format Y-axis labels
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Years',
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
});



// Lấy dữ liệu từ biến revenueByCity được truyền từ server
const revenueByCity = JSON.parse(document.getElementById('revenueByCity').textContent); // Parse dữ liệu từ hidden input hoặc tag

// Tách dữ liệu từ revenueByCity
const provinceLabels = revenueByCity.map(item => item.city); // Lấy danh sách các tỉnh
const provinceSales = revenueByCity.map(item => item.totalRevenue); // Lấy doanh thu theo tỉnh

// Chọn canvas để vẽ đồ thị
const provinceCanvas = document.getElementById('provinceChart').getContext('2d');

// Vẽ đồ thị cột
new Chart(provinceCanvas, {
    type: "bar", // Loại biểu đồ
    data: {
        labels: provinceLabels, // Các tỉnh (trục X)
        datasets: [
            {
                label: "Doanh thu theo tỉnh (VND)", // Nhãn cho dữ liệu
                data: provinceSales, // Dữ liệu doanh thu
                backgroundColor: [
                    "rgba(54, 162, 235, 0.7)", // Màu của từng cột
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                    "rgba(255, 159, 64, 0.7)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)", // Viền của từng cột
                    "rgba(255, 99, 132, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)"
                ],
                borderWidth: 1 // Độ dày viền
            }
        ]
    },
    options: {
        responsive: true, // Biểu đồ tự động co giãn
        plugins: {
            legend: {
                display: true, // Hiển thị chú giải
                position: "top", // Vị trí của chú giải
                labels: {
                    font: {
                        size: 14 // Cỡ chữ
                    }
                }
            },
            title: {
                display: true, // Hiển thị tiêu đề
                text: "Doanh thu theo tỉnh",
                font: {
                    size: 18 // Cỡ chữ tiêu đề
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true, // Trục Y bắt đầu từ 0
                title: {
                    display: true,
                    text: "Doanh thu (VND)", // Tiêu đề trục Y
                    font: {
                        size: 14
                    }
                },
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString(); // Format số trên trục Y
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: "Các tỉnh", // Tiêu đề trục X
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
});
