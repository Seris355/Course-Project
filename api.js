document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(), 
            fio: form.fio.value,
            nickname: form.nickname.value,
            password: form.password.value,
            phone: form.phone.value,
            birthdate: form.birthdate.value,
            email: form.email.value,
            registrationDate: new Date().toISOString()
        };
        
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                alert('Регистрация успешно завершена!');
                form.reset();
                window.location.href = 'aut.html';
            } else {
                throw new Error('Ошибка при отправке данных');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
        }
    });
});