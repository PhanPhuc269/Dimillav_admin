
    document.addEventListener('DOMContentLoaded', function () {
        const filterForm = document.getElementById('filter-form');
        const sortDropdown = document.getElementById('sortDropdown');
        const productList = document.querySelector('.row.row-cols-1.row-cols-md-2.row-cols-lg-3.g-4');
        const paginationContainer = document.querySelector('.pagination');

        // Function to fetch products via AJAX
        const fetchProducts = async (params) => {
            try {
                const query = new URLSearchParams(params).toString();
                const response = await fetch(`/product/api/products?${query}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching products:', error);
                alert('Error fetching products.');
            }
        };

        // Function to render products
        const renderProducts = (products) => {
            productList.innerHTML = '';
            products.forEach(product => {
                const productCard = `
                    <div class="col">
                        <div class="card shadow-sm h-100 border-0">
                            <img src="${product.images[0]}" alt="${product.name}" class="card-img-top img-fluid">
                            <div class="card-body">
                                <h5 class="card-title text-primary">${product.name}</h5>
                              <p class="card-text text-muted mb-1">Sale Price: <span class="fw-bold">VND ${product.salePrice}</span> </p>
                               <p class="card-text text-muted mb-1">Original Price: <span class="fw-bold">VND ${product.originalPrice}</span> </p>          	
                            
                            </div>
                            <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                                <a href="/product/update/${product.slug}" class="btn btn-outline-primary btn-sm">
                                    <i class="bi bi-pencil"></i> Edit
                                </a>
                                <form action="/product/delete/${product.slug}" method="POST" style="margin: 0;">
                                    <button type="submit" class="btn btn-outline-danger btn-sm">
                                        <i class="bi bi-trash"></i> Delete
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                `;
                productList.insertAdjacentHTML('beforeend', productCard);
            });
        };

        // Function to render pagination
        const renderPagination = (currentPage, totalPages, params) => {
            const pagination = document.querySelector('.pagination');
            if (!pagination) return;

            pagination.innerHTML = '';

            // Previous Button
            const prevClass = currentPage > 1 ? '' : 'disabled';
            const prevPage = currentPage > 1 ? currentPage - 1 : 1;
            const prevButton = `
                <li class="page-item ${prevClass}">
                    <a class="page-link" href="#" data-page="${prevPage}" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            `;
            pagination.insertAdjacentHTML('beforeend', prevButton);

            // Page Numbers
            for (let i = 1; i <= totalPages; i++) {
                const activeClass = i === currentPage ? 'active' : '';
                const pageButton = `
                    <li class="page-item ${activeClass}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
                pagination.insertAdjacentHTML('beforeend', pageButton);
            }

            // Next Button
            const nextClass = currentPage < totalPages ? '' : 'disabled';
            const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
            const nextButton = `
                <li class="page-item ${nextClass}">
                    <a class="page-link" href="#" data-page="${nextPage}" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            `;
            pagination.insertAdjacentHTML('beforeend', nextButton);
        };

        // Function to get current filter and sort parameters
        const getFilters = () => {
            const formData = new FormData(filterForm);
            const params = {};
            formData.forEach((value, key) => {
                if (params[key]) {
                    if (Array.isArray(params[key])) {
                        params[key].push(value);
                    } else {
                        params[key] = [params[key], value];
                    }
                } else {
                    params[key] = value;
                }
            });

            // Get sort parameter from dropdown
            const urlParams = new URLSearchParams(window.location.search);
            const sort = urlParams.get('sort');
            if (sort) params.sort = sort;

            return params;
        };

        // Event listener for filter form submission
        filterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const params = getFilters();
            params.page = 1; // Reset to first page on new filter
            const data = await fetchProducts(params);
            if (data) {
                renderProducts(data.products);
                renderPagination(data.currentPage, data.totalPages, params);
            }
        });

        // Event delegation for pagination links
        document.addEventListener('click', async function (e) {
            if (e.target.closest('.page-link')) {
                e.preventDefault();
                const page = e.target.closest('.page-link').dataset.page;
                if (!page) return;

                const params = getFilters();
                params.page = page;

                const data = await fetchProducts(params);
                if (data) {
                    renderProducts(data.products);
                    renderPagination(data.currentPage, data.totalPages, params);
                }
            }
        });

        // Event listener for sort dropdown
        sortDropdown.addEventListener('click', async function (e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const sort = e.target.getAttribute('href').split('sort=')[1].split('&')[0];
                const params = getFilters();
                params.sort = sort;
                params.page = 1; // Reset to first page on sort

                const data = await fetchProducts(params);
                if (data) {
                    renderProducts(data.products);
                    renderPagination(data.currentPage, data.totalPages, params);
                }
            }
        });

        // Initial load
        (async () => {
            const params = getFilters();
            const data = await fetchProducts(params);
            if (data) {
                renderProducts(data.products);
                renderPagination(data.currentPage, data.totalPages, params);
            }
        })();
    });
