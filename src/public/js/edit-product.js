// Tạo thẻ link để tải CSS động
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/css/edit-product.css';
document.head.appendChild(link);
// Mở modal hiển thị ảnh
function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageUrl;
    modal.style.display = 'flex';
}

// Đóng modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
}

//Lấy slug sản phẩm từ url
const url = window.location.pathname;
const slug = url.substring(url.lastIndexOf('/') + 1);
let deleteImageIndex = null;
// Hàm mở modal xác nhận
window.openDeleteImageModal = function (event, index) {
    deleteImageIndex = index;
    const deleteImageModal = new bootstrap.Modal(document.getElementById('confirm-delete-image-modal'));
    deleteImageModal.show();
};
// Hàm xử lý khi người dùng xác nhận xóa ảnh
document.getElementById('confirm-delete-image-btn').addEventListener('click', function (event) {
    if (deleteImageIndex !== null) {
        removeImage(event, deleteImageIndex); // Gọi hàm xóa ảnh
        deleteImageIndex = null; // Reset chỉ số
    }

    // Ẩn modal sau khi xóa
    const deleteImageModal = bootstrap.Modal.getInstance(document.getElementById('confirm-delete-image-modal'));
    deleteImageModal.hide();
});
// Function to remove an image
function removeImage(event, index) {
    event.stopPropagation();
    fetch(`/product/remove-image/${slug}/${index}`, { method: 'Delete' }) // Replace with your actual API endpoint
        .then(response =>{
            if(response.status==200)
            {
                showToast('Xóa ảnh thành công', 'success', 'Success');

                // Xóa phần tử HTML tương ứng khỏi giao diện
                const imageItem = document.getElementById(`image-item-${index}`);
                if (imageItem) {
                    imageItem.remove();
                }
            }
            else
            {
                showToast('Xóa ảnh thất bại', 'error', 'Error');
            }
        })
        .then(data => {
            if (data.success) {
                window.location.reload(); // Reload page to reflect changes
            } else {
                alert('Failed to remove image');
            }
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const stockTableBody = document.getElementById('stock-table-body');
    const stockDataInput = document.createElement('input'); // Hidden field for stock
    stockDataInput.type = 'hidden';
    stockDataInput.name = 'stock';
    stockDataInput.id = 'stock-data';
    document.querySelector('form').appendChild(stockDataInput);

    const addStockButton = document.getElementById('add-stock-entry-button');
    const saveStockEntryButton = document.getElementById('save-stock-entry');
    const stockColorInput = document.getElementById('stock-color');
    const stockSizeInput = document.getElementById('stock-size');
    const stockQuantityInput = document.getElementById('stock-quantity');

    const updateStockData = () => {
        const stockData = [];
        const rows = stockTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const color = row.querySelector('input[name*="[color]"]').value.trim();
            const size = row.querySelector('input[name*="[size]"]').value.trim();
            const quantity = row.querySelector('input[name*="[quantity]"]').value.trim();

            if (color && size && quantity) {
                stockData.push({
                    color,
                    size: parseInt(size, 10),
                    quantity: parseInt(quantity, 10),
                });
            }
        });

        stockDataInput.value = JSON.stringify(stockData); // Save JSON stock
    };

    addStockButton.addEventListener('click', function () {
        const addStockModal = new bootstrap.Modal(document.getElementById('add-stock-modal'));
        addStockModal.show();
    });

    saveStockEntryButton.addEventListener('click', function () {
        const color = stockColorInput.value.trim();
        const size = stockSizeInput.value.trim();
        const quantity = stockQuantityInput.value.trim();

        if (!color || !size || !quantity) {
            alert('Please fill out all fields');
            return;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" name="stock[new][color][]" value="${color}" class="form-control" required />
            </td>
            <td>
                <input type="number" name="stock[new][size][]" value="${size}" class="form-control" min="0" required />
            </td>
            <td>
                <input type="number" name="stock[new][quantity][]" value="${quantity}" class="form-control" min="0" required />
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm delete-stock-entry">Delete</button>
            </td>
        `;

        row.querySelector('.delete-stock-entry').addEventListener('click', function () {
            row.remove();
        });

        stockTableBody.appendChild(row);

        stockColorInput.value = '';
        stockSizeInput.value = '';
        stockQuantityInput.value = '';

        const addStockModal = bootstrap.Modal.getInstance(document.getElementById('add-stock-modal'));
        addStockModal.hide();
    });

    // Handle deleting existing rows
    stockTableBody.querySelectorAll('.delete-stock-entry').forEach(button => {
        button.addEventListener('click', function () {
            button.closest('tr').remove();
        });
    });

    document.querySelector('form').addEventListener('submit', function () {
        updateStockData(); // Update stock data before submitting
    });
});