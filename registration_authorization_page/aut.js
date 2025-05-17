document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const login = loginInput.value.trim();
        const password = passwordInput.value;
        errorMessage.textContent = '';
        
        if (!login) {
            showError('Введите логин');
            return;
        }
        
        if (!password) {
            showError('Введите пароль');
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
                showError('Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Ошибка при авторизации:', error);
            showError('Произошла ошибка при авторизации. Попробуйте позже.');
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
    }
});