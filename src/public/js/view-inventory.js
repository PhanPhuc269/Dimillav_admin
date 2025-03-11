document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const actionButton = document.querySelector('.check-all-submit-btn');
    const selectAllOptions = document.querySelector('.select-all-options');
    const selectCategory = document.querySelector('.select-category');
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const pageInfo = document.getElementById('page-info');
    const restockModal = document.getElementById('restock-modal');

    let currentPage = 1;
    let currentFilters = {};
    const totalPages = parseInt(pageInfo.getAttribute('data-total-pages'), 10);

    // Lấy thông tin bộ lọc từ URL
    function updateCurrentFiltersFromURL() {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.forEach((value, key) => {
            currentFilters[key] = value;
        });
    }

    updateCurrentFiltersFromURL();

    // Cập nhật ô tìm kiếm và danh mục khi tải trang
    function updateFiltersFromURL() {
        const currentUrl = new URL(window.location.href);

        // Cập nhật tìm kiếm
        const query = currentUrl.searchParams.get('query');
        if (query) {
            document.getElementById('search-query').value = query;
            currentFilters.query = query;
        }

        // Cập nhật danh mục
        const category = currentUrl.searchParams.get('category');
        if (category) {
            selectCategory.value = category;
            currentFilters.category = category;
        }
    }

    updateFiltersFromURL();

    // Khi danh mục thay đổi
    selectCategory.addEventListener('change', function () {
        const category = selectCategory.value;
        if (category) {
            currentFilters.category = category;
        } else {
            delete currentFilters.category;
        }
        currentFilters.page = 1;
        fetchInventory(currentFilters);
    });

    // Tìm kiếm
    searchButton.addEventListener('click', function () {
        const query = document.getElementById('search-query').value;
        currentFilters.query = query;
        currentFilters.page = 1;
        fetchInventory(currentFilters);
    });

    // Phân trang
    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            fetchInventory({ page: currentPage - 1 });
        }
    });

    nextPageButton.addEventListener('click', function () {
        if (currentPage < totalPages) {
            fetchInventory({ page: currentPage + 1 });
        }
    });

    // // Hành động hàng loạt
    // actionButton.addEventListener('click', function () {
    //     const action = selectAllOptions.value;
    //     const selectedItems = Array.from(
    //         inventoryTableBody.querySelectorAll('input[name="inventory[]"]:checked')
    //     ).map(checkbox => ({
    //         id: checkbox.dataset.id,
    //         size: checkbox.dataset.size,
    //         color: checkbox.dataset.color,
    //     }));

    //     if (!action || selectedItems.length === 0) {
    //         alert('Vui lòng chọn hành động và ít nhất một sản phẩm.');
    //         return;
    //     }

    //     if (action === 'delete') {
    //         performBulkDelete(selectedItems);
    //     } else if (action === 'restock') {
    //         openRestockModal(selectedItems[0]);
    //     }
    // });

    // Hàm gọi API để lấy dữ liệu inventory
    function fetchInventory(params = {}) {
        currentFilters = { ...currentFilters, ...params };
        const url = new URL('/inventory', window.location.origin);
        Object.keys(currentFilters).forEach(key => {
            if (typeof currentFilters[key] === 'object') {
                Object.keys(currentFilters[key]).forEach(subKey => {
                    // Kiểm tra xem tham số đã tồn tại hay chưa, nếu có thì xóa để tránh trùng lặp
                    url.searchParams.delete(`${key}[${subKey}]`);
                    url.searchParams.append(`${key}[${subKey}]`, currentFilters[key][subKey]);
                });
            } else {
                // Kiểm tra xem tham số đã tồn tại hay chưa, nếu có thì xóa để tránh trùng lặp
                url.searchParams.delete(key);
                url.searchParams.append(key, currentFilters[key]);
            }
        });

        window.history.pushState({}, '', url);

        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => response.json())
            .then(data => {
                renderInventory(data.inventory);
                updatePagination(data.page, data.totalPages);
            });
    }

    // Hàm render danh sách inventory
    function renderInventory(items) {
        inventoryTableBody.innerHTML = items
            .map(item => {
                return item.stock
                    .map(stock => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${item.brand}</td>
                            <td>${stock.color}</td>
                            <td>${stock.size}</td>
                            <td>${stock.quantity}</td>
                            <td>${item.slug}-${stock.color}-${stock.size}</td>
                            <td>${formatCurrencyVND(item.salePrice)}</td>
                            <td>
                                <button class="btn btn-sm btn-success restock-button" data-id="${item._id}" data-name="${item.name}" data-category="${item.category}" data-brand="${item.brand}" data-size="${stock.size}" data-color="${stock.color}" data-quantity="${stock.quantity}" data-bs-toggle="modal" data-bs-target="#restock-modal">Nhập hàng</button>
                                <button class="btn btn-sm btn-danger delete-button" data-id="${item._id}" data-size="${stock.size}" data-color="${stock.color}">Xóa</button>
                            </td>
                        </tr>
                    `)
                    .join('');
            })
            .join('');
    }

    // Hàm cập nhật phân trang
    function updatePagination(page, totalPages) {
        currentPage = page;
        document.querySelector('.pagination-info').textContent = `Page ${page} of ${totalPages}`;
        prevPageButton.disabled = page <= 1;
        nextPageButton.disabled = page >= totalPages;
    }

    // Hàm mở modal nhập hàng
    function openRestockModal(item) {
        document.getElementById('restock-color').value = item.color;
        document.getElementById('restock-size').value = item.size;
        document.getElementById('restock-quantity').value = 0;
    }
    restockModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
    
        // Lấy dữ liệu từ các thuộc tính data-*
        const productId = button.getAttribute('data-id');
        const productName = button.getAttribute('data-name');
        const productCategory = button.getAttribute('data-category');
        const productBrand = button.getAttribute('data-brand');
        const color = button.getAttribute('data-color');
        const size = button.getAttribute('data-size');
        const currentQuantity = button.getAttribute('data-quantity');
    
        // Gán giá trị cho các trường trong modal
        document.getElementById('restock-name').value = productName;
        document.getElementById('restock-category').value = productCategory;
        document.getElementById('restock-brand').value = productBrand;
        document.getElementById('restock-color').value = color;
        document.getElementById('restock-size').value = size;
        document.getElementById('restock-quantity-current').value = currentQuantity;
    
        // Gán productId vào dataset của form để sử dụng khi gửi yêu cầu
        document.getElementById('restock-form').dataset.id = productId;
    });
    // Hàm nhập hàng
    document.getElementById('btn-restock').addEventListener('click', function () {
        const id = document.getElementById('restock-form').dataset.id;
        const size = document.getElementById('restock-size').value;
        const color = document.getElementById('restock-color').value;
        const quantity = parseInt(document.getElementById('restock-quantity').value, 10);

        fetch('/inventory/restock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, size, color, quantity }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Nhập hàng thành công!', 'success', 'Success');
                fetchInventory({ page: currentPage });
                //Làm rỗng các trường nhập liệu
                document.getElementById('restock-quantity').value = '';
                document.getElementById('restock-form').dataset.id = '';
                document.getElementById('restock-form').reset();
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(restockModal);
                modal.hide();
            } else {
                showToast(data.message, 'error', 'Error');
            }
        });
    });


    // Sắp xếp
    document.querySelectorAll('a[data-field]').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const field = this.dataset.field;
            const currentType = this.dataset.type;
            const nextType = currentType === 'asc' ? 'desc' : 'asc';

            fetchInventory({ _sort: { column: field, type: nextType }, page: 1 });
            updateSortIcons(field, nextType);
        });
    });
    // Hàm cập nhật biểu tượng sắp xếp
    function updateSortIcons(sortField, sortOrder) {
        document.querySelectorAll('a[data-field]').forEach(link => {
            const field = link.dataset.field;
            const icon = link.querySelector('i');
            if (field === sortField) {
                icon.className =
                    sortOrder === 'asc'
                        ? 'fa-solid fa-arrow-down-short-wide'
                        : 'fa-solid fa-arrow-down-wide-short';
                link.dataset.type = sortOrder;
            } else {
                icon.className = 'fa-solid fa-sort';
                link.dataset.type = 'default';
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function () {
    let deleteProductId = null;
    let deleteProductIndex = null;

    const confirmDeleteModal = document.getElementById('confirm-delete-modal');

    // Khi modal hiển thị
    confirmDeleteModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget; // Nút kích hoạt modal
        deleteProductId = button.getAttribute('data-id');
        deleteProductIndex = button.getAttribute('data-index');
        const productName = button.getAttribute('data-name');
        const productColor = button.getAttribute('data-color');
        const productSize = button.getAttribute('data-size');

        // Hiển thị thông tin trong modal
        document.getElementById('delete-product-name').textContent = productName;
        document.getElementById('delete-product-color').textContent = productColor;
        document.getElementById('delete-product-size').textContent = productSize;
    });

    // Khi người dùng xác nhận xóa
    document.getElementById('btn-confirm-delete').addEventListener('click', function () {
        if (deleteProductId && deleteProductIndex !== null) {
            // Gửi yêu cầu xóa đến server
            fetch(`/inventory/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: deleteProductId,
                    index: deleteProductIndex, // Gửi chỉ số đến server
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Xóa thành công!', 'success', 'Success');
                        // Reload lại bảng hoặc xóa dòng hiện tại khỏi giao diện
                        location.reload();
                    } else {
                        showToast('Xóa thất bại', 'error', 'Error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Có lỗi xảy ra khi xóa!', 'error', 'Error');
                })
                .finally(() => {
                    // Đóng modal sau khi xóa
                    const modalInstance = bootstrap.Modal.getInstance(confirmDeleteModal);
                    modalInstance.hide();
                });
        }
    });
});
