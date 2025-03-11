document.addEventListener('DOMContentLoaded', function () {
    const stockTableBody = document.getElementById('stock-table-body');
    const addStockButton = document.getElementById('add-stock-entry-button');
    const saveStockEntryButton = document.getElementById('save-stock-entry');
    const stockColorInput = document.getElementById('stock-color');
    const stockSizeInput = document.getElementById('stock-size');
    const stockQuantityInput = document.getElementById('stock-quantity');
    const form = document.querySelector('#add-product');

    // Hidden input field to store stock data
    const stockDataInput = document.createElement('input');
    stockDataInput.type = 'hidden';
    stockDataInput.name = 'stock';
    form.appendChild(stockDataInput);

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
            <td>${color}</td>
            <td>${size}</td>
            <td>${quantity}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm delete-stock-entry">Delete</button>
            </td>
        `;

        row.querySelector('.delete-stock-entry').addEventListener('click', function () {
            row.remove();
            updateStockData();
        });

        stockTableBody.appendChild(row);
        updateStockData();

        stockColorInput.value = '';
        stockSizeInput.value = '';
        stockQuantityInput.value = '';

        const addStockModal = bootstrap.Modal.getInstance(document.getElementById('add-stock-modal'));
        addStockModal.hide();
    });

    // Function to update the hidden stock input field
    function updateStockData() {
        const stockData = [];
        const rows = stockTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            stockData.push({
                color: cells[0].textContent.trim(),
                size: parseInt(cells[1].textContent.trim(), 10),
                quantity: parseInt(cells[2].textContent.trim(), 10),
            });
        });
        stockDataInput.value = JSON.stringify(stockData);
    }

    // Update stock data before form submission
    form.addEventListener('submit', function () {
        updateStockData();
    });
});
