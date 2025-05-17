document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const middleNameInput = document.getElementById('middleName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const birthdateInput = document.getElementById('birthdate');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const nicknameInput = document.getElementById('nickname');
    const generateNicknameBtn = document.getElementById('generateNickname');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const generatedPasswordContainer = document.getElementById('generatedPasswordContainer');
    const generatedPasswordDisplay = document.getElementById('generatedPassword');
    const copyPasswordBtn = document.getElementById('copyPassword');
    const agreementCheckbox = document.getElementById('agreement');
    const registerBtn = document.getElementById('registerBtn');
    const nicknameAttempts = document.getElementById('nicknameAttempts');
    const attemptsCount = document.getElementById('attemptsCount');
    
    const fioError = document.getElementById('fioError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');
    const birthdateError = document.getElementById('birthdateError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const nicknameError = document.getElementById('nicknameError');
    const agreementError = document.getElementById('agreementError');
    
    let nicknameAttemptsLeft = 5;
    let isGeneratedPassword = false;
    let users = [];

    async function loadUsers() {
        try {
            const response = await fetch('http://localhost:3000/users');
            if (response.ok) {
                users = await response.json();
            } else {
                console.error('Ошибка загрузки пользователей:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    }
    
    async function checkFieldUniqueness(field, value, errorElement, errorMessage) {
        if (!value) return '';
        
        if (users.length === 0) {
            await loadUsers();
        }
        
        const isUnique = !users.some(user => user[field].toLowerCase() === value.toLowerCase());
        if (!isUnique) {
            errorElement.textContent = errorMessage;
            return errorMessage;
        }
        errorElement.textContent = '';
        return '';
    }
    
    const commonPasswords = [
        'password', '123456', '123456789', 'guest', 'qwerty', '12345678', '111111', 
        '12345', 'col123456', '123123', '1234567', '1234', '1234567890', '000000', 
        '555555', '666666', '123321', '654321', '7777777', '123', 'iloveyou', '1q2w3e4r', 
        '987654321', 'qwertyuiop', 'mynoob', '123qwe', '18atcskd2w', '3rjs1la7qe', 
        'google', '1q2w3e4r5t', '12345qwert', 'qwerty123', 'zxcvbnm', '1q2w3e', '55555', 
        'qwe123', '777777', '159753', 'asdfghjkl', '2wsx3edc', '!@#$%^&*', '123456a', 
        '123456789a', 'aa12345678', 'abc123', 'password1', '1234qwer', 'qwerty1', '12345678910',
        '00000000', '11111111', '112233', '121212', '12344321', '123654', '131313', '123456789q',
        '159357', '1qaz2wsx', '222222', '654321', '66666666', '696969', '888888', '987654',
        'admin', 'asdasd', 'asdfgh', 'football', 'hello', 'jordan23', 'letmein', 'login',
        'master', 'michael', 'monkey', 'mustang', 'passw0rd', 'password123', 'photoshop',
        'princess', 'qazwsx', 'qwerty12', 'qwertyui', 'shadow', 'solo', 'starwars', 'sunshine',
        'superman', 'trustno1', 'welcome', 'whatever', 'zaq1zaq1'
    ];
    
    function generateRandomPassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += specials.charAt(Math.floor(Math.random() * specials.length));
        
        const allChars = lowercase + uppercase + numbers + specials;
        for (let i = 4; i < 8 + Math.floor(Math.random() * 13); i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    function generateNickname() {
        const adjectives = ['Cool', 'Smart', 'Funny', 'Brave', 'Wise', 'Happy', 'Gentle', 'Wild', 'Silent', 'Mystic', 'Magic'];
        const nouns = ['Wolf', 'Eagle', 'Bear', 'Tiger', 'Dragon', 'Phoenix', 'Lion', 'Fox', 'Owl', 'Panther', 'Pants'];
        const numbers = Math.floor(Math.random() * 1000);
        
        return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
            nouns[Math.floor(Math.random() * nouns.length)]}${
            numbers}`;
    }
    
    function validatePassword(password) {
        if (password.length < 8 || password.length > 20) {
            return 'Пароль должен содержать от 8 до 20 символов';
        }
        
        if (!/[A-Z]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну заглавную букву';
        }
        
        if (!/[a-z]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну строчную букву';
        }
        
        if (!/[0-9]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну цифру';
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Пароль должен содержать хотя бы один специальный символ';
        }
        
        if (commonPasswords.includes(password.toLowerCase())) {
            return 'Этот пароль слишком распространен, выберите другой';
        }
        
        return '';
    }
    
    function validatePhone(phone) {
        const regex = /^\+375(25|29|33|44)\d{7}$/;
        if (!regex.test(phone)) {
            return 'Введите корректный номер телефона (+375XXXXXXXXX)';
        }
        return '';
    }
    
    function validateBirthdate(date) {
        if (!date) return 'Укажите дату рождения';
        
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 16) {
            return 'Вам должно быть не менее 16 лет для регистрации';
        }
        
        return '';
    }
    
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return 'Введите корректный email';
        }
        return '';
    }
    
    function validateFio() {
        if (!firstNameInput.value.trim()) {
            return 'Укажите имя';
        }
        
        if (!lastNameInput.value.trim()) {
            return 'Укажите фамилию';
        }
        
        return '';
    }
    
    async function validateForm() {
        let isValid = true;
        
        const fioErrorMsg = validateFio();
        fioError.textContent = fioErrorMsg;
        if (fioErrorMsg) isValid = false;
        
        const phoneErrorMsg = validatePhone(phoneInput.value);
        phoneError.textContent = phoneErrorMsg;
        if (phoneErrorMsg) isValid = false;
        
        if (!phoneErrorMsg) {
            const phoneUniquenessError = await checkFieldUniqueness('phone', phoneInput.value, phoneError, 'Этот телефон уже занят');
            if (phoneUniquenessError) isValid = false;
        }
        
        const emailErrorMsg = validateEmail(emailInput.value);
        emailError.textContent = emailErrorMsg;
        if (emailErrorMsg) isValid = false;
        
        if (!emailErrorMsg) {
            const emailUniquenessError = await checkFieldUniqueness('email', emailInput.value, emailError, 'Этот email уже занят');
            if (emailUniquenessError) isValid = false;
        }

        const birthdateErrorMsg = validateBirthdate(birthdateInput.value);
        birthdateError.textContent = birthdateErrorMsg;
        if (birthdateErrorMsg) isValid = false;
        
        const passwordErrorMsg = validatePassword(passwordInput.value);
        passwordError.textContent = passwordErrorMsg;
        if (passwordErrorMsg) isValid = false;
        
        if (passwordInput.value !== confirmPasswordInput.value && !isGeneratedPassword) {
            confirmPasswordError.textContent = 'Пароли не совпадают';
            isValid = false;
        } else {
            confirmPasswordError.textContent = '';
        }
        
        if (!nicknameInput.value) {
            nicknameError.textContent = 'Введите никнейм';
            isValid = false;
        } else {
            const nicknameUniquenessError = await checkFieldUniqueness('nickname', nicknameInput.value, nicknameError, 'Этот никнейм уже занят');
            if (nicknameUniquenessError) isValid = false;
        }
        
        if (!agreementCheckbox.checked) {
            agreementError.textContent = 'Необходимо принять соглашение';
            isValid = false;
        } else {
            agreementError.textContent = '';
        }
    
        registerBtn.disabled = !isValid;
        
        return isValid;
    }
    
    generatePasswordBtn.addEventListener('click', function() {
        const newPassword = generateRandomPassword();
        passwordInput.value = newPassword;
        confirmPasswordInput.value = newPassword;
        generatedPasswordDisplay.textContent = newPassword;
        generatedPasswordContainer.style.display = 'block';
        isGeneratedPassword = true;
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        
        validateForm();
    });
    
    copyPasswordBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(generatedPasswordDisplay.textContent)
            .then(() => alert('Пароль скопирован в буфер обмена'))
            .catch(err => console.error('Ошибка копирования: ', err));
    });
    
    generateNicknameBtn.addEventListener('click', function() {
        if (nicknameAttemptsLeft > 0) {
            nicknameInput.value = generateNickname();
            nicknameAttemptsLeft--;
            attemptsCount.textContent = nicknameAttemptsLeft;
            
            if (nicknameAttemptsLeft < 5) {
                nicknameAttempts.style.display = 'block';
            }
            
            if (nicknameAttemptsLeft === 0) {
                nicknameInput.readOnly = false;
                generateNicknameBtn.disabled = true;
                nicknameInput.placeholder = 'Введите свой никнейм';
            }
            
            nicknameError.textContent = '';
            validateForm();
        }
    });
    
    nicknameInput.addEventListener('input', async function() {
        if (nicknameInput.value) {
            await checkFieldUniqueness('nickname', nicknameInput.value, nicknameError, 'Этот никнейм уже занят');
        } else {
            nicknameError.textContent = '';
        }
        validateForm();
    });
    
    emailInput.addEventListener('input', async function() {
        const emailErrorMsg = validateEmail(emailInput.value);
        emailError.textContent = emailErrorMsg;
        
        if (!emailErrorMsg && emailInput.value) {
            await checkFieldUniqueness('email', emailInput.value, emailError, 'Этот email уже занят');
        }
        validateForm();
    });
    
    phoneInput.addEventListener('input', async function() {
        const phoneErrorMsg = validatePhone(phoneInput.value);
        phoneError.textContent = phoneErrorMsg;
        
        if (!phoneErrorMsg && phoneInput.value) {
            await checkFieldUniqueness('phone', phoneInput.value, phoneError, 'Этот телефон уже занят');
        }
        validateForm();
    });
    
    [firstNameInput, lastNameInput].forEach(input => {
        input.addEventListener('input', validateForm);
    });

    form.addEventListener('input', function(e) {
        if (e.target !== generatePasswordBtn && e.target !== generateNicknameBtn) {
            isGeneratedPassword = false;
            validateForm();
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateForm()) {
            const formData = {
                id: Date.now(),
                fio: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`,
                nickname: nicknameInput.value,
                password: passwordInput.value,
                phone: phoneInput.value,
                birthdate: birthdateInput.value,
                email: emailInput.value,
                registrationDate: new Date().toISOString(),
                favorite: []
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
                    console.log('Перенаправление на /aut.html');
                    form.reset();
                    generatedPasswordContainer.style.display = 'none';
                    nicknameAttemptsLeft = 5;
                    attemptsCount.textContent = nicknameAttemptsLeft;
                    nicknameAttempts.style.display = 'none';
                    nicknameInput.readOnly = true;
                    generateNicknameBtn.disabled = false;
                    registerBtn.disabled = true;
                    window.location.href = './aut.html'; 
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка сервера:', errorData);
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }
    });

    loadUsers();
    generateNicknameBtn.click();
});