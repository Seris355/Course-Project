document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'http://localhost:3000/products';
  const USERS_URL = 'http://localhost:3000/users';
  
  const productsGrid = document.getElementById('products-grid');
  const noResults = document.getElementById('no-results');
  
  let currentUser = JSON.parse(localStorage.getItem('currentUser'));
  let productsData = [];
  let userFavorites = [];
  
  init();
  
  async function init() {
    if (!currentUser) {
      showEmptyFavorites();
      return;
    }
    
    await Promise.all([loadProducts(), loadUserFavorites()]);
    renderFavorites();
    setupEventListeners();
    toggleLanguage(localStorage.getItem('language') || 'ru'); // Apply translations
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
  
  function renderFavorites() {
    if (!userFavorites || userFavorites.length === 0) {
      showEmptyFavorites();
      return;
    }
    
    noResults.style.display = 'none';
    productsGrid.style.display = 'grid';
    
    productsGrid.innerHTML = '';
    
    const favoriteProducts = productsData.filter(product => 
      userFavorites.includes(product.id.toString())
    );
    
    favoriteProducts.forEach(product => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
    });
    
    toggleLanguage(localStorage.getItem('language') || 'ru'); // Re-apply translations
  }
  
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.pass}" alt="${product.name}" data-translate-alt="product_${product.name.toLowerCase().replace(/[\s+&.\/]/g, '_')}_name" class="product-image">
      <div class="product-info">
        <span class="product-category" data-translate="category_${product.category.toLowerCase()}">${product.category}</span>
        <h3 class="product-name" data-translate="product_${product.name.toLowerCase().replace(/[\s+&.\/]/g, '_')}_name">${product.name}</h3>
        <p class="product-description" data-translate="product_${product.name.toLowerCase().replace(/[\s+&.\/]/g, '_')}_description">${product.description}</p>
        <div class="product-price">${product.price} BYN</div>
        <div class="product-actions">
          <div class="product-rating">★ ${product.rating}</div>
          <div class="action-buttons">
            <button class="favorite-btn active" data-product-id="${product.id}">
              <img src="/images_foote_header/heart.svg" alt="Избранное" data-translate-alt="favorite_alt">
            </button>
            <button class="cart-btn" data-product-id="${product.id}">
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
  }
  
  async function handleProductAction(e) {
    const target = e.target.closest('.favorite-btn, .cart-btn');
    if (!target) return;
    
    e.preventDefault();
    
    if (target.classList.contains('favorite-btn')) {
      await toggleFavorite(target);
    } else if (target.classList.contains('cart-btn')) {
      await addToCart(target);
    }
    
    renderFavorites(); // Re-render after action
  }
  
  async function toggleFavorite(btn) {
    const productId = btn.dataset.productId;
    
    try {
      userFavorites = userFavorites.filter(id => id !== productId.toString());
      btn.classList.remove('active');
      
      await fetch(`${USERS_URL}/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: userFavorites })
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  }
  
  async function addToCart(btn) {
    const productId = btn.dataset.productId;
    console.log(`Add to cart product ${productId}`);
  }
  
  function showEmptyFavorites() {
    productsGrid.innerHTML = '';
    productsGrid.style.display = 'none';
    noResults.style.display = 'block';
    toggleLanguage(localStorage.getItem('language') || 'ru'); // Apply translations
  }
});