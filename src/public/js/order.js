document.addEventListener('DOMContentLoaded', async () => {
    const statusFilter = document.getElementById('statusFilter');
    const orderListContainer = document.getElementById('orderListContainer');

    // Lấy giá trị status từ URL nếu có
    const urlParams = new URLSearchParams(window.location.search);
    const currentStatus = urlParams.get('status') || '';

    // Thiết lập giá trị mặc định cho dropdown
    statusFilter.value = currentStatus;

    // Gọi hàm load dữ liệu lần đầu tiên
    await fetchAndRenderOrders(currentStatus);

    // Thay đổi trạng thái và cập nhật URL
    statusFilter.addEventListener('change', () => {
        const selectedStatus = statusFilter.value;

        // Cập nhật URL
        const newUrl = new URL(window.location.href);
        if (selectedStatus) {
            newUrl.searchParams.set('status', selectedStatus);
        } else {
            newUrl.searchParams.delete('status');
        }
        history.pushState(null, '', newUrl);

        // Lọc đơn hàng
        fetchAndRenderOrders(selectedStatus);
    });

    // Hàm fetch dữ liệu và cập nhật giao diện
    async function fetchAndRenderOrders(status) {
        try {
            const response = await fetch(`/order/filter?status=${status}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const { orders } = await response.json();
                orderListContainer.innerHTML = renderOrders(orders);
            } else {
                console.error('Error fetching orders:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Hàm render danh sách đơn hàng
    function renderOrders(orders) {
        if (!orders || orders.length === 0) {
            return '<h4>Không có đơn hàng nào phù hợp.</h4>';
        }

        return `
            <div class="order_table">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Mã khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                            <th>Cập nhật trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order._id}</td>
                                <td>${order.customerId}</td>
                                <td>${order.createdAt}</td>
                                <td>$${order.totalAmount}</td>
                                <td>${order.status}</td>
                                <td>
                                    <a href="/order/detail/${order._id}" class="btn btn-info">Xem chi tiết</a>
                                </td>
                                <td>
                                    <select class="form-select update-status" data-id="${order._id}">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                                        <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Đã hủy</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Lắng nghe sự kiện thay đổi trạng thái
    document.addEventListener('change', async (event) => {
        if (event.target.classList.contains('update-status')) {
            const orderId = event.target.getAttribute('data-id');
            const newStatus = event.target.value;

            try {
                const response = await fetch(`/order/updateStatus/${orderId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (response.ok) {
                    alert('Cập nhật trạng thái thành công!');
                } else {
                    alert('Cập nhật trạng thái thất bại.');
                }
            } catch (error) {
                console.error('Error updating order status:', error);
                alert('Có lỗi xảy ra khi cập nhật trạng thái.');
            }
        }
    });
});
