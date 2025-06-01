document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');


  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const login = loginInput.value.trim();
    const password = passwordInput.value;
    const language = localStorage.getItem('language') || 'ru';
    errorMessage.textContent = '';
    
    if (!login) {
      showError('error_empty_login', language);
      return;
    }
    
    if (!password) {
      showError('error_empty_password', language);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/users');
      const users = await response.json();
      
      const user = users.find(u => u.nickname === login && u.password === password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          nickname: user.nickname,
          fio: user.fio,
          email: user.email,
          password: user.password
        }));
        
        window.location.href = '/main_page/main.html'; 
      } else {
        showError('error_invalid_credentials', language);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('error_login_failed', language);
    }
  });
  
  function showError(key, language) {
    errorMessage.textContent = translations[language][key] || key;
    errorMessage.setAttribute('data-translate', key);
  }
});