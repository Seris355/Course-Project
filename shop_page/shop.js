document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/products';
    const USERS_URL = 'http://localhost:3000/users';
    const ORDERS_URL = 'http://localhost:3000/orders';
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
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
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
    
    async function renderProducts(products) {
        productsGrid.innerHTML = '';
        
        let userFavorites = [];
        let userOrder = null;
        
        if (currentUser) {
            try {
                const userResponse = await fetch(`${USERS_URL}/${currentUser.id}`);
                const userData = await userResponse.json();
                userFavorites = userData.favorite || [];
                
                const orderResponse = await fetch(`${ORDERS_URL}?user_id=${currentUser.id}`);
                const orders = await orderResponse.json();
                userOrder = orders[0] || null;
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const isFavorite = userFavorites.includes(product.id);
            
            productCard.innerHTML = `
                <img src="${product.pass}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price} BYN</div>
                    <div class="product-actions">
                        <div class="product-rating">★ ${product.rating}</div>
                        <div class="action-buttons">
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}">
                                <img src="/images_foote_header/heart.svg" alt="Избранное">
                            </button>
                            <div class="quantity-controls">
                                <button class="decrease-quantity" data-product-id="${product.id}">-</button>
                                <span class="quantity">1</span>
                                <button class="increase-quantity" data-product-id="${product.id}">+</button>
                            </div>
                            <button class="cart-btn" data-product-id="${product.id}">
                                <img src="/images_foote_header/shopping-cart.svg" alt="Корзина" class="product_cart">
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        setupProductActions();
    }
    
   function setupProductActions() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!currentUser) {
                    alert('Для добавления в избранное необходимо авторизоваться');
                    return;
                }
                
                const productId = btn.dataset.productId;
                const isActive = btn.classList.contains('active');
                
                try {
                    const response = await fetch(`${USERS_URL}/${currentUser.id}`);
                    const userData = await response.json();
                    let favorites = userData.favorite || [];
                    
                    if (isActive) {
                        favorites = favorites.filter(id => id !== productId);
                        btn.classList.remove('active');
                    } else {
                        if (favorites.includes(productId)) return;
                        favorites.push(productId);
                        btn.classList.add('active');
                    }
                    
                    await fetch(`${USERS_URL}/${currentUser.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ favorite: favorites })
                    });
                    
                } catch (error) {
                    console.error('Error updating favorites:', error);
                }
            });
        });
        
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const quantityElement = btn.nextElementSibling;
                let quantity = parseInt(quantityElement.textContent);
                
                if (quantity > 1) {
                    quantity--;
                    quantityElement.textContent = quantity;
                }
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const quantityElement = btn.previousElementSibling;
                let quantity = parseInt(quantityElement.textContent);
                
                quantity++;
                quantityElement.textContent = quantity;
            });
        });
        
        document.querySelectorAll('.cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!currentUser) {
                    alert('Для добавления в корзину необходимо авторизоваться');
                    return;
                }
                
                const productId = btn.dataset.productId;
                const quantityElement = btn.closest('.action-buttons').querySelector('.quantity');
                const quantity = parseInt(quantityElement.textContent);
                
                try {
                    const orderResponse = await fetch(`${ORDERS_URL}?user_id=${currentUser.id}`);
                    const orders = await orderResponse.json();
                    let userOrder = orders[0];
                    
                    if (!userOrder) {
                        const newOrder = {
                            user_id: currentUser.id,
                            date: new Date().toISOString(),
                            items: [{ product_id: productId, quantity: quantity }]
                        };
                        
                        await fetch(ORDERS_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newOrder)
                        });
                    } else {
                        const itemIndex = userOrder.items.findIndex(item => item.product_id === productId);
                        
                        if (itemIndex === -1) {
                            userOrder.items.push({ product_id: productId, quantity: quantity });
                        } else {
                            userOrder.items[itemIndex].quantity += quantity;
                        }
                        
                        await fetch(`${ORDERS_URL}/${userOrder.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(userOrder)
                        });
                    }
                    
                    quantityElement.textContent = '1';
                    
                    showNotification('Товар добавлен в корзину');
                    
                } catch (error) {
                    console.error('Error updating cart:', error);
                    showNotification('Ошибка при добавлении в корзину', 'error');
                }
            });
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