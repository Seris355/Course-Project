document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/products';
    const ORDERS_URL = 'http://localhost:3000/orders';
    const USERS_URL = 'http://localhost:3000/users';
    
    const productsGrid = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    const totalPriceElement = document.getElementById('total-price');
    const orderBtn = document.getElementById('order-btn');
    const orderSuccess = document.getElementById('order-success');
    const finalPriceElement = document.getElementById('final-price');
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let userOrder = null;
    let productsData = [];
    let userFavorites = [];
    
    init();
    
    async function init() {
        if (!currentUser) {
            showEmptyCart();
            return;
        }
        
        await Promise.all([loadProducts(), loadUserFavorites(), loadOrder()]);
        renderCart();
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
    
    function renderCart() {
        if (!userOrder || !userOrder.items || userOrder.items.length === 0) {
            showEmptyCart();
            return;
        }
        
        noResults.style.display = 'none';
        productsGrid.style.display = 'grid';
        orderBtn.style.display = 'block';
        orderSuccess.style.display = 'none';
        
        productsGrid.innerHTML = '';
        
        userOrder.items.forEach(item => {
            const product = productsData.find(p => p.id === item.product_id);
            if (!product) return;
            
            const isFavorite = userFavorites.includes(product.id);
            const productCard = createProductCard(product, item.quantity, isFavorite);
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
                            <span class="quantity">${quantity}</span>
                            <button class="increase-quantity" data-product-id="${product.id}">+</button>
                        </div>
                        <button class="cart-btn" data-product-id="${product.id}" disabled>
                            <img src="/images_foote_header/shopping-cart.svg" alt="Корзина">
                        </button>
                    </div>
                </div>
            </div>
        `;
        return card;
    }
    
    function setupEventListeners() {
        productsGrid.addEventListener('click', handleProductAction);
        orderBtn.addEventListener('click', handleOrderSubmit);
    }
    
    async function handleProductAction(e) {
        const target = e.target.closest('.decrease-quantity, .increase-quantity, .favorite-btn');
        if (!target) return;
        
        e.preventDefault();
        
        if (target.classList.contains('favorite-btn')) {
            await toggleFavorite(target);
            return;
        }
        
        await updateProductQuantity(target);
    }
    
    async function toggleFavorite(btn) {
        const productId = btn.dataset.productId;
        const isActive = btn.classList.contains('active');
        
        try {
            if (isActive) {
                userFavorites = userFavorites.filter(id => id !== productId);
                btn.classList.remove('active');
            } else {
                if (userFavorites.includes(productId)) return;
                userFavorites.push(productId);
                btn.classList.add('active');
            }
            
            await fetch(`${USERS_URL}/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: userFavorites })
            });
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    }
    
    async function updateProductQuantity(target) {
        const productId = target.dataset.productId;
        const quantityElement = target.parentElement.querySelector('.quantity');
        let quantity = parseInt(quantityElement.textContent);
        const itemIndex = userOrder.items.findIndex(item => item.product_id === productId);
        
        if (target.classList.contains('decrease-quantity')) {
            quantity--;
            
            if (quantity < 1) {
                userOrder.items.splice(itemIndex, 1);
                
                if (userOrder.items.length === 0) {
                    await deleteOrder();
                    showEmptyCart();
                    return;
                }
            } else {
                userOrder.items[itemIndex].quantity = quantity;
                quantityElement.textContent = quantity;
            }
        } else {
            quantity++;
            userOrder.items[itemIndex].quantity = quantity;
            quantityElement.textContent = quantity;
        }
        
        await updateOrder();
        updateTotalPrice();
    }
    
    async function handleOrderSubmit(e) {
        e.preventDefault();
        
        if (!userOrder?.items?.length) return;
        
        const totalPrice = calculateTotalPrice();
        finalPriceElement.textContent = totalPrice.toFixed(2);
        orderSuccess.style.display = 'block';
        orderBtn.style.display = 'none';
        
        await deleteOrder();
        showEmptyCart();
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
                    body: JSON.stringify({
                        ...userOrder,
                        user_id: currentUser.id,
                        date: new Date().toISOString()
                    })
                });
                userOrder = await response.json();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    }
    
    async function deleteOrder() {
        try {
            if (userOrder?.id) {
                await fetch(`${ORDERS_URL}/${userOrder.id}`, { 
                    method: 'DELETE' 
                });
            }
            userOrder = null;
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    }
    
    function calculateTotalPrice() {
        if (!userOrder?.items) return 0;
        
        return userOrder.items.reduce((total, item) => {
            const product = productsData.find(p => p.id === item.product_id);
            return total + (product?.price || 0) * item.quantity;
        }, 0);
    }
    
    function updateTotalPrice() {
        totalPriceElement.textContent = `Итого: ${calculateTotalPrice().toFixed(2)} BYN`;
    }
    
    function showEmptyCart() {
        productsGrid.innerHTML = '';
        productsGrid.style.display = 'none';
        orderBtn.style.display = 'none';
        noResults.style.display = 'block';
        orderSuccess.style.display = 'none';
        totalPriceElement.textContent = 'Итого: 0 BYN';
    }
});
