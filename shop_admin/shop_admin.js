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

  toggleLanguage(localStorage.getItem('language') || 'ru');

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
      const language = localStorage.getItem('language') || 'ru';

      categories = [...new Set(products.map(p => p.category))];

      categoryFilter.innerHTML = `<option value="" data-translate="filter_all">${translations[language]['filter_all']}</option>`;
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        const categoryKey = `category_${category.toLowerCase().replace(' ', '_')}`;
        option.textContent = translations[language][categoryKey] || category;
        option.setAttribute('data-translate', categoryKey);
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
    const language = localStorage.getItem('language') || 'ru';

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';

      const isEdited = editedProducts[product.id] || newProducts.some(p => p.id === product.id);
      const categoryKey = `category_${product.category.toLowerCase().replace(' ', '_')}`;

      productCard.innerHTML = `
        <img src="${product.pass}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <span class="product-category" data-translate="${categoryKey}">${translations[language][categoryKey] || product.category}</span>
          <div class="admin-form">
            <input type="text" class="product-id" value="${product.id}" ${isEdited ? '' : 'readonly'} data-translate-placeholder="placeholder_product_id" placeholder="${translations[language]['placeholder_product_id']}">
            <input type="text" class="product-name" value="${product.name}" data-translate-placeholder="placeholder_product_name" placeholder="${translations[language]['placeholder_product_name']}">
            <input type="number" class="product-price" value="${product.price}" data-translate-placeholder="placeholder_product_price" placeholder="${translations[language]['placeholder_product_price']}" min="0" step="0.01">
            <select class="product-category-select">
              ${categories.map(c => `<option value="${c}" ${c === product.category ? 'selected' : ''} data-translate="category_${c.toLowerCase().replace(' ', '_')}">${translations[language][`category_${c.toLowerCase().replace(' ', '_')}`] || c}</option>`).join('')}
            </select>
            <textarea class="product-description" data-translate-placeholder="placeholder_product_description" placeholder="${translations[language]['placeholder_product_description']}">${product.description}</textarea>
            <input type="number" class="product-rating" value="${product.rating}" data-translate-placeholder="placeholder_product_rating" placeholder="${translations[language]['placeholder_product_rating']}" min="0" max="5" step="0.1">
            <input type="text" class="product-image-path" value="${product.pass}" data-translate-placeholder="placeholder_product_image" placeholder="${translations[language]['placeholder_product_image']}">
          </div>
          <button class="delete-btn" data-product-id="${product.id}" data-translate="button_delete_product">${translations[language]['button_delete_product']}</button>
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
        const language = localStorage.getItem('language') || 'ru';

        try {
          await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
          });

          loadProducts();
          showNotification(translations[language]['notification_product_deleted']);
        } catch (error) {
          console.error('Error deleting product:', error);
          showNotification(translations[language]['notification_delete_error'], 'error');
        }
      });
    });

    document.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea').forEach(input => {
      input.addEventListener('change', (e) => {
        const productCard = e.target.closest('.product-card');
        const productId = productCard.querySelector('.product-id').value;
        const language = localStorage.getItem('language') || 'ru';

        if (e.target.classList.contains('product-price')) {
          const value = parseFloat(e.target.value);
          if (isNaN(value) || value < 0) {
            e.target.value = 0;
            showNotification(translations[language]['notification_invalid_price'] || 'Price must be a non-negative number', 'error');
          }
        }

        if (e.target.classList.contains('product-rating')) {
          const value = parseFloat(e.target.value);
          if (isNaN(value) || value < 0 || value > 5) {
            e.target.value = value < 0 ? 0 : 5;
            showNotification(translations[language]['notification_invalid_rating'] || 'Rating must be between 0 and 5', 'error');
          }
        }

        if (!editedProducts[productId]) {
          const originalProduct = productsData.find(p => p.id === productId);
          if (originalProduct) {
            editedProducts[productId] = { ...originalProduct };
          }
        }

        editedProducts[productId] = {
          ...editedProducts[productId],
          id: productCard.querySelector('.product-id').value,
          name: productCard.querySelector('.product-name').value,
          price: parseFloat(productCard.querySelector('.product-price').value) || 0,
          category: productCard.querySelector('.product-category-select').value,
          description: productCard.querySelector('.product-description').value,
          rating: parseFloat(productCard.querySelector('.product-rating').value) || 0,
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
        const language = localStorage.getItem('language') || 'ru';

        for (const id of newIds) {
          if (allIds.includes(id)) {
            showNotification(translations[language]['notification_id_exists'].replace('%s', id), 'error');
            return;
          }
          allIds.push(id);
        }

        for (const product of updates) {
          const originalProduct = productsData.find(p => p.id === product.id);
          if (!originalProduct && allIds.includes(product.id)) {
            showNotification(translations[language]['notification_id_exists'].replace('%s', product.id), 'error');
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
        showNotification(translations[language]['notification_changes_saved']);
      } catch (error) {
        console.error('Error saving changes:', error);
        showNotification(translations[language]['notification_save_error'], 'error');
      }
    });

    addProductBtn.addEventListener('click', async () => {
      let newId;
      do {
        newId = Math.floor(Math.random() * 1000000).toString();
      } while (allProductIds.includes(newId));

      const language = localStorage.getItem('language') || 'ru';
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
        <img src="" alt="${translations[language]['new_product']}" class="product-image">
        <div class="product-info">
          <span class="product-category" data-translate="new_product">${translations[language]['new_product']}</span>
          <div class="admin-form">
            <input type="text" class="product-id" value="${newId}" data-translate-placeholder="placeholder_product_id" placeholder="${translations[language]['placeholder_product_id']}" readonly>
            <input type="text" class="product-name" value="" data-translate-placeholder="placeholder_product_name" placeholder="${translations[language]['placeholder_product_name']}">
            <input type="number" class="product-price" value="0" data-translate-placeholder="placeholder_product_price" placeholder="${translations[language]['placeholder_product_price']}" min="0" step="0.01">
            <select class="product-category-select">
              ${categories.map(c => `<option value="${c}" data-translate="category_${c.toLowerCase().replace(' ', '_')}">${translations[language][`category_${c.toLowerCase().replace(' ', '_')}`] || c}</option>`).join('')}
            </select>
            <textarea class="product-description" data-translate-placeholder="placeholder_product_description" placeholder="${translations[language]['placeholder_product_description']}"></textarea>
            <input type="number" class="product-rating" value="0" data-translate-placeholder="placeholder_product_rating" placeholder="${translations[language]['placeholder_product_rating']}" min="0" max="5" step="0.1">
            <input type="text" class="product-image-path" value="" data-translate-placeholder="placeholder_product_image" placeholder="${translations[language]['placeholder_product_image']}">
          </div>
          <button class="delete-btn delete-new-btn" data-translate="button_cancel_add">${translations[language]['button_cancel_add']}</button>
        </div>
      `;

      productsGrid.prepend(productCard);

      productCard.querySelector('.delete-new-btn').addEventListener('click', () => {
        newProducts = newProducts.filter(p => p !== newProduct);
        productCard.remove();
      });

      productCard.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea').forEach(input => {
        input.addEventListener('change', (e) => {
          const language = localStorage.getItem('language') || 'ru';

          if (e.target.classList.contains('product-price')) {
            const value = parseFloat(e.target.value);
            if (isNaN(value) || value < 0) {
              e.target.value = 0;
              showNotification(translations[language]['notification_invalid_price'] || 'Price must be a non-negative number', 'error');
            }
          }

          if (e.target.classList.contains('product-rating')) {
            const value = parseFloat(e.target.value);
            if (isNaN(value) || value < 0 || value > 5) {
              e.target.value = value < 0 ? 0 : 5;
              showNotification(translations[language]['notification_invalid_rating'] || 'Rating must be between 0 and 5', 'error');
            }
          }

          newProduct.id = productCard.querySelector('.product-id').value;
          newProduct.name = productCard.querySelector('.product-name').value;
          newProduct.price = parseFloat(productCard.querySelector('.product-price').value) || 0;
          newProduct.category = productCard.querySelector('.product-category-select').value;
          newProduct.description = productCard.querySelector('.product-description').value;
          newProduct.rating = parseFloat(productCard.querySelector('.product-rating').value) || 0;
          newProduct.pass = productCard.querySelector('.product-image-path').value;

          const img = productCard.querySelector('.product-image');
          if (newProduct.pass) {
            img.src = newProduct.pass;
            img.alt = newProduct.name || translations[language]['new_product'];
          }

          const categorySpan = productCard.querySelector('.product-category');
          const categoryKey = `category_${newProduct.category.toLowerCase().replace(' ', '_')}`;
          categorySpan.textContent = translations[language][categoryKey] || newProduct.category;
          categorySpan.setAttribute('data-translate', categoryKey);
        });
      });
    });
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('data-translate', Object.keys(translations[localStorage.getItem('language') || 'ru']).find(key => translations[localStorage.getItem('language') || 'ru'][key] === message) || '');

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
});