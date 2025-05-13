document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/products';
    const ITEMS_PER_PAGE = 8;
    
    const productsGrid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const ratingFilter = document.getElementById('rating-filter');
    const sortBy = document.getElementById('sort-by');
    
    let currentPage = 1;
    let totalProducts = 0;
    let categories = [];
    
    init();
    
    async function init() {
        await loadCategories();
        loadProducts();
        setupEventListeners();
    }
    
    async function loadCategories() {
        try {
            const response = await fetch(`${API_URL}?_page=1&_limit=1000`);
            const products = await response.json();
            
            categories = [...new Set(products.map(p => p.category))];
            
            categoryFilter.innerHTML = '<option value="">Все</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async function loadProducts() {
        const url = buildApiUrl();
        
        try {
            const response = await fetch(url);
            const products = await response.json();
            
            const totalCountResponse = await fetch(url.replace(/_page=\d+&_limit=\d+/, '_page=1&_limit=1000'));
            const allProducts = await totalCountResponse.json();
            totalProducts = Array.isArray(allProducts) ? allProducts.length : 0;
            
            renderProducts(products);
            renderPagination();
            
            if (products.length === 0) {
                noResults.style.display = 'block';
                productsGrid.style.display = 'none';
            } else {
                noResults.style.display = 'none';
                productsGrid.style.display = 'grid';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            noResults.style.display = 'block';
            productsGrid.style.display = 'none';
        }
    }
    
    function buildApiUrl() {
        const params = [];
        
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            params.push(`q=${encodeURIComponent(searchQuery)}`);
        }
        
        const category = categoryFilter.value;
        if (category) {
            params.push(`category=${encodeURIComponent(category)}`);
        }
        
        const minPrice = priceMin.value;
        const maxPrice = priceMax.value;
        if (minPrice) {
            params.push(`price_gte=${minPrice}`);
        }
        if (maxPrice) {
            params.push(`price_lte=${maxPrice}`);
        }
        
        const minRating = ratingFilter.value;
        if (minRating && minRating !== '0') {
            params.push(`rating_gte=${minRating}`);
        }
        
        const sortValue = sortBy.value;
        if (sortValue) {
            const [field, order] = sortValue.split('_');
            params.push(`_sort=${field}&_order=${order}`);
        }
        
        params.push(`_page=${currentPage}&_limit=${ITEMS_PER_PAGE}`);
        
        return `${API_URL}?${params.join('&')}`;
    }
    
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.pass}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price} BYN</div>
                    <div class="product-rating">★ ${product.rating}</div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
    }
    
    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        
        if (totalPages <= 1) return;
        
        const prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadProducts();
            }
        });
        pagination.appendChild(prevButton);
        
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadProducts();
            });
            
            pagination.appendChild(pageButton);
        }
        
        const nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadProducts();
            }
        });
        pagination.appendChild(nextButton);
    }
    
    function setupEventListeners() {
        searchBtn.addEventListener('click', () => {
            currentPage = 1;
            loadProducts();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                loadProducts();
            }
        });
        
        categoryFilter.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
        
        priceMin.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
        
        priceMax.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
        
        ratingFilter.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
        
        sortBy.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
    }
});