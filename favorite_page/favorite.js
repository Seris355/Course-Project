document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/products';
    const ORDERS_URL = 'http://localhost:3000/orders';
    const USERS_URL = 'http://localhost:3000/users';
    
    const productsGrid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    const totalPriceElement = document.getElementById('total-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const orderSuccess = document.getElementById('order-success');
    const finalPriceElement = document.getElementById('final-price');
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let userOrder = null;
    let productsData = [];
    let userFavorites = [];
    let favoriteQuantities = {}; 
    
    init();
    
    async function init() {
        if (!currentUser) {
            showEmptyFavorites();
            return;
        }
        
        await Promise.all([loadProducts(), loadUserFavorites(), loadOrder()]);
        renderFavorites();
        setupEventListeners();
    }
    
    async function loadProducts() {
        try {
            const response = await fetch(API_URL);
            productsData = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
    
    async function loadUserFavorites() {
        try {
            const response = await fetch(`${USERS_URL}/${currentUser.id}`);
            const userData = await response.json();
            userFavorites = userData.favorite || [];
            userFavorites.forEach(id => {
                if (!favoriteQuantities[id]) favoriteQuantities[id] = 1;
            });
        } catch (error) {
            console.error('Error loading user favorites:', error);
        }
    }
    
    async function loadOrder() {
        try {
            const response = await fetch(`${ORDERS_URL}?user_id=${currentUser.id}`);
            const orders = await response.json();
            userOrder = orders[0] || null;
        } catch (error) {
            console.error('Error loading order:', error);
        }
    }
    
    function renderFavorites() {
        if (!userFavorites || userFavorites.length === 0) {
            showEmptyFavorites();
            return;
        }
        
        noResults.style.display = 'none';
        productsGrid.style.display = 'grid';
        addToCartBtn.style.display = 'block';
        orderSuccess.style.display = 'none';
        
        productsGrid.innerHTML = '';
        
        userFavorites.forEach(productId => {
            const product = productsData.find(p => p.id.toString() === productId);
            if (!product) return;
            
            const quantity = favoriteQuantities[productId] || 1;
            const productCard = createProductCard(product, quantity, true);
            productsGrid.appendChild(productCard);
        });
        
        updateTotalPrice();
    }
    
    function createProductCard(product, quantity, isFavorite) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.pass}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <span class="product-category" data-translate="category_${product.category.toLowerCase()}">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} BYN</div>
                <div class="product-actions">
                    <div class="product-rating">★ ${product.rating}</div>
                    <div class="action-buttons">
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}">
                            <img src="/images_foote_header/heart.svg" alt="Избранное" data-translate-alt="favorite_alt">
                        </button>
                        <div class="quantity-controls">
                            <button class="decrease-quantity" data-product-id="${product.id}">-</button>
                            <span class="quantity">${quantity}</span>
                            <button class="increase-quantity" data-product-id="${product.id}">+</button>
                        </div>
                        <button class="cart-btn" data-product-id="${product.id}" disabled>
                            <img src="/images_foote_header/shopping-cart.svg" alt="Корзина" data-translate-alt="cart_alt">
                        </button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }
    
    function setupEventListeners() {
        productsGrid.addEventListener('click', handleProductAction);
        addToCartBtn.addEventListener('click', handleAddToCart);
    }
    
    async function handleProductAction(e) {
        const target = e.target.closest('.decrease-quantity, .increase-quantity, .favorite-btn');
        if (!target) return;
        
        e.preventDefault();
        e.stopPropagation(); 
        
        if (target.classList.contains('favorite-btn')) {
            await toggleFavorite(target);
            return;
        }
        
        updateFavoriteQuantity(target);
    }
    
    async function toggleFavorite(btn) {
        const productId = btn.dataset.productId;
        const isActive = btn.classList.contains('active');
        
        try {
            if (isActive) {
                userFavorites = userFavorites.filter(id => id !== productId);
                delete favoriteQuantities[productId];
                btn.classList.remove('active');
            } else {
                if (!userFavorites.includes(productId)) {
                    userFavorites.push(productId);
                    favoriteQuantities[productId] = 1;
                    btn.classList.add('active');
                }
            }
            
            await fetch(`${USERS_URL}/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: userFavorites })
            });
            
            renderFavorites();
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    }
    
    function updateFavoriteQuantity(target) {
        const productId = target.dataset.productId;
        const quantityElement = target.parentElement.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        
        if (target.classList.contains('decrease-quantity')) {
            quantity = Math.max(1, quantity - 1);
        } else {
            quantity++;
        }
        
        favoriteQuantities[productId] = quantity;
        quantityElement.textContent = quantity;
        updateTotalPrice();
    }
    
    async function handleAddToCart(e) {
        e.preventDefault();
        
        if (!userFavorites.length) return;
        
        try {
            if (!userOrder) {
                userOrder = {
                    user_id: currentUser.id,
                    items: userFavorites.map(id => ({
                        product_id: id,
                        quantity: favoriteQuantities[id] || 1
                    })),
                    date: new Date().toISOString()
                };
            } else {
                userFavorites.forEach(id => {
                    const quantity = favoriteQuantities[id] || 1;
                    const itemIndex = userOrder.items.findIndex(item => item.product_id === id);
                    if (itemIndex >= 0) {
                        userOrder.items[itemIndex].quantity += quantity;
                    } else {
                        userOrder.items.push({ product_id: id, quantity });
                    }
                });
            }
            
            await updateOrder();
            
            const totalPrice = calculateTotalPrice();
            finalPriceElement.textContent = totalPrice.toFixed(2);
            orderSuccess.style.display = 'block';
            addToCartBtn.style.display = 'none';
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }
    
    async function updateOrder() {
        try {
            if (userOrder.id) {
                await fetch(`${ORDERS_URL}/${userOrder.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userOrder)
                });
            } else {
                const response = await fetch(ORDERS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userOrder)
                });
                userOrder = await response.json();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }
    
    function calculateTotalPrice() {
        if (!userFavorites.length) return 0;
        
        return userFavorites.reduce((total, id) => {
            const product = productsData.find(p => p.id.toString() === id);
            const quantity = favoriteQuantities[id] || 1;
            return total + (product?.price || 0) * quantity;
        }, 0);
    }
    
    function updateTotalPrice() {
        totalPriceElement.textContent = `Итого: ${calculateTotalPrice().toFixed(2)} BYN`;
    }
    
    function showEmptyFavorites() {
        productsGrid.innerHTML = '';
        productsGrid.style.display = 'none';
        addToCartBtn.style.display = 'none';
        noResults.style.display = 'block';
        orderSuccess.style.display = 'none';
        totalPriceElement.textContent = 'Итого: 0 BYN';
    }
});