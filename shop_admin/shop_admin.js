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
    const saveChangesBtn = document.getElementById('save-changes');
    const addProductBtn = document.getElementById('add-product');
    
    let currentPage = 1;
    let totalProducts = 0;
    let categories = [];
    let productsData = [];
    let editedProducts = {};
    let newProducts = [];
    let allProductIds = [];
    
    init();
    
    async function init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.nickname !== 'admin') {
            window.location.href = '/main_page/main.html';
            return;
        }
        
        await loadAllProductIds();
        await loadCategories();
        loadProducts();
        setupEventListeners();
    }
    
    async function loadAllProductIds() {
        try {
            const response = await fetch(`${API_URL}?_page=1&_limit=1000`);
            const products = await response.json();
            allProductIds = products.map(p => p.id);
        } catch (error) {
            console.error('Error loading product IDs:', error);
        }
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
            productsData = products;
            
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
            
            const isEdited = editedProducts[product.id] || newProducts.some(p => p.id === product.id);
            
            productCard.innerHTML = `
                <img src="${product.pass}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <div class="admin-form">
                        <input type="text" class="product-id" value="${product.id}" ${isEdited ? '' : 'readonly'} placeholder="ID продукта">
                        <input type="text" class="product-name" value="${product.name}" placeholder="Название">
                        <input type="number" class="product-price" value="${product.price}" placeholder="Цена" min="0" step="0.01" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        <select class="product-category-select">
                            ${categories.map(c => `<option value="${c}" ${c === product.category ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                        <textarea class="product-description">${product.description}</textarea>
                        <input type="number" class="product-rating" value="${product.rating}" placeholder="Рейтинг" min="0" max="5" step="0.1" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        <input type="text" class="product-image-path" value="${product.pass}" placeholder="Путь к изображению">
                    </div>
                    <button class="delete-btn" data-product-id="${product.id}">Удалить товар</button>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        setupProductActions();
    }
    
    function setupProductActions() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                
                    try {
                        await fetch(`${API_URL}/${productId}`, {
                            method: 'DELETE'
                        });
                        
                        loadProducts();
                        showNotification('Товар успешно удален');
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showNotification('Ошибка при удалении товара', 'error');
                    }
            });
        });
        
        document.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea').forEach(input => {
            input.addEventListener('change', (e) => {
                const productCard = e.target.closest('.product-card');
                const productId = productCard.querySelector('.product-id').value;
                
                if (!editedProducts[productId]) {
                    const originalProduct = productsData.find(p => p.id === productId);
                    if (originalProduct) {
                        editedProducts[productId] = {...originalProduct};
                    }
                }
                
                editedProducts[productId] = {
                    ...editedProducts[productId],
                    id: productCard.querySelector('.product-id').value,
                    name: productCard.querySelector('.product-name').value,
                    price: parseFloat(productCard.querySelector('.product-price').value),
                    category: productCard.querySelector('.product-category-select').value,
                    description: productCard.querySelector('.product-description').value,
                    rating: parseFloat(productCard.querySelector('.product-rating').value),
                    pass: productCard.querySelector('.product-image-path').value
                };
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
        
        saveChangesBtn.addEventListener('click', async () => {
            try {

                const allIds = [...allProductIds];
                const updates = Object.values(editedProducts);
                const newIds = newProducts.map(p => p.id);
            
                for (const id of newIds) {
                    if (allIds.includes(id)) {
                        showNotification(`ID ${id} уже существует`, 'error');
                        return;
                    }
                    allIds.push(id);
                }
                

                for (const product of updates) {
                    const originalProduct = productsData.find(p => p.id === product.id);
                    if (!originalProduct && allIds.includes(product.id)) {
                        showNotification(`ID ${product.id} уже существует`, 'error');
                        return;
                    }
                }
                
                const savePromises = updates.map(product => 
                    fetch(`${API_URL}/${product.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(product)
                    })
                );
                
                const addPromises = newProducts.map(product => 
                    fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(product)
                    })
                );
                
                await Promise.all([...savePromises, ...addPromises]);
                
                editedProducts = {};
                newProducts = [];
                await loadAllProductIds();
                loadProducts();
                showNotification('Изменения успешно сохранены');
            } catch (error) {
                console.error('Error saving changes:', error);
                showNotification('Ошибка при сохранении изменений', 'error');
            }
        });
        
        addProductBtn.addEventListener('click', async () => {

            let newId;
            do {
                newId = Math.floor(Math.random() * 1000000).toString();
            } while (allProductIds.includes(newId));
            
            const newProduct = {
                id: newId,
                name: '',
                price: 0,
                category: categories[0] || '',
                description: '',
                rating: 0,
                pass: ''
            };
            
            newProducts.push(newProduct);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="" alt="Новый товар" class="product-image">
                <div class="product-info">
                    <span class="product-category">Новый товар</span>
                    <div class="admin-form">
                        <input type="text" class="product-id" value="${newId}" placeholder="ID продукта (уникальный)" readonly>
                        <input type="text" class="product-name" value="" placeholder="Название">
                        <input type="number" class="product-price" value="0" placeholder="Цена" min="0" step="0.01" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        <select class="product-category-select">
                            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <textarea class="product-description" placeholder="Описание"></textarea>
                        <input type="number" class="product-rating" value="0" placeholder="Рейтинг" min="0" max="5" step="0.1" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        <input type="text" class="product-image-path" value="" placeholder="Путь к изображению">
                    </div>
                    <button class="delete-btn delete-new-btn">Отменить добавление</button>
                </div>
            `;
            
            productsGrid.prepend(productCard);
            
            productCard.querySelector('.delete-new-btn').addEventListener('click', () => {
                newProducts = newProducts.filter(p => p !== newProduct);
                productCard.remove();
            });
            
            productCard.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea').forEach(input => {
                input.addEventListener('change', (e) => {
                    newProduct.id = productCard.querySelector('.product-id').value;
                    newProduct.name = productCard.querySelector('.product-name').value;
                    newProduct.price = parseFloat(productCard.querySelector('.product-price').value);
                    newProduct.category = productCard.querySelector('.product-category-select').value;
                    newProduct.description = productCard.querySelector('.product-description').value;
                    newProduct.rating = parseFloat(productCard.querySelector('.product-rating').value);
                    newProduct.pass = productCard.querySelector('.product-image-path').value;
                    
                    const img = productCard.querySelector('.product-image');
                    if (newProduct.pass) {
                        img.src = newProduct.pass;
                        img.alt = newProduct.name || 'Новый товар';
                    }
                    
                    const categorySpan = productCard.querySelector('.product-category');
                    categorySpan.textContent = newProduct.category || 'Новый товар';
                });
            });
        });
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
});