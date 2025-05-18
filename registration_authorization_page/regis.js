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

  toggleLanguage(localStorage.getItem('language') || 'ru');

  async function loadUsers() {
    try {
      const response = await fetch('http://localhost:3000/users');
      if (response.ok) {
        users = await response.json();
      } else {
        console.error('Error loading users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async function checkFieldUniqueness(field, value, errorElement, errorKey) {
    if (!value) return '';

    if (users.length === 0) {
      await loadUsers();
    }

    const isUnique = !users.some(user => user[field].toLowerCase() === value.toLowerCase());
    const language = localStorage.getItem('language') || 'ru';
    if (!isUnique) {
      errorElement.textContent = translations[language][errorKey] || errorKey;
      errorElement.setAttribute('data-translate', errorKey);
      return errorKey;
    }
    errorElement.textContent = '';
    errorElement.removeAttribute('data-translate');
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
    const language = localStorage.getItem('language') || 'ru';
    if (password.length < 8 || password.length > 20) {
      return 'error_password_length';
    }

    if (!/[A-Z]/.test(password)) {
      return 'error_password_no_uppercase';
    }

    if (!/[a-z]/.test(password)) {
      return 'error_password_no_lowercase';
    }

    if (!/[0-9]/.test(password)) {
      return 'error_password_no_digit';
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'error_password_no_special';
    }

    if (commonPasswords.includes(password.toLowerCase())) {
      return 'error_password_common';
    }

    return '';
  }

  function validatePhone(phone) {
    const regex = /^\+375(25|29|33|44)\d{7}$/;
    if (!regex.test(phone)) {
      return 'error_invalid_phone';
    }
    return '';
  }

  function validateBirthdate(date) {
    if (!date) return 'error_invalid_birthdate';

    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      return 'error_underage';
    }

    return '';
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return 'error_invalid_email';
    }
    return '';
  }

  function validateFio() {
    if (!firstNameInput.value.trim()) {
      return 'error_first_name_empty';
    }

    if (!lastNameInput.value.trim()) {
      return 'error_last_name_empty';
    }

    return '';
  }

  async function validateForm() {
    let isValid = true;
    const language = localStorage.getItem('language') || 'ru';

    const fioErrorMsg = validateFio();
    fioError.textContent = fioErrorMsg ? translations[language][fioErrorMsg] : '';
    fioError.setAttribute('data-translate', fioErrorMsg || '');
    if (fioErrorMsg) isValid = false;

    const phoneErrorMsg = validatePhone(phoneInput.value);
    phoneError.textContent = phoneErrorMsg ? translations[language][phoneErrorMsg] : '';
    phoneError.setAttribute('data-translate', phoneErrorMsg || '');
    if (phoneErrorMsg) isValid = false;

    if (!phoneErrorMsg) {
      const phoneUniquenessError = await checkFieldUniqueness('phone', phoneInput.value, phoneError, 'error_phone_taken');
      if (phoneUniquenessError) isValid = false;
    }

    const emailErrorMsg = validateEmail(emailInput.value);
    emailError.textContent = emailErrorMsg ? translations[language][emailErrorMsg] : '';
    emailError.setAttribute('data-translate', emailErrorMsg || '');
    if (emailErrorMsg) isValid = false;

    if (!emailErrorMsg) {
      const emailUniquenessError = await checkFieldUniqueness('email', emailInput.value, emailError, 'error_email_taken');
      if (emailUniquenessError) isValid = false;
    }

    const birthdateErrorMsg = validateBirthdate(birthdateInput.value);
    birthdateError.textContent = birthdateErrorMsg ? translations[language][birthdateErrorMsg] : '';
    birthdateError.setAttribute('data-translate', birthdateErrorMsg || '');
    if (birthdateErrorMsg) isValid = false;

    const passwordErrorMsg = validatePassword(passwordInput.value);
    passwordError.textContent = passwordErrorMsg ? translations[language][passwordErrorMsg] : '';
    passwordError.setAttribute('data-translate', passwordErrorMsg || '');
    if (passwordErrorMsg) isValid = false;

    if (passwordInput.value !== confirmPasswordInput.value && !isGeneratedPassword) {
      confirmPasswordError.textContent = translations[language]['error_password_mismatch'];
      confirmPasswordError.setAttribute('data-translate', 'error_password_mismatch');
      isValid = false;
    } else {
      confirmPasswordError.textContent = '';
      confirmPasswordError.removeAttribute('data-translate');
    }

    if (!nicknameInput.value) {
      nicknameError.textContent = translations[language]['error_nickname_empty'];
      nicknameError.setAttribute('data-translate', 'error_nickname_empty');
      isValid = false;
    } else {
      const nicknameUniquenessError = await checkFieldUniqueness('nickname', nicknameInput.value, nicknameError, 'error_nickname_taken');
      if (nicknameUniquenessError) isValid = false;
    }

    if (!agreementCheckbox.checked) {
      agreementError.textContent = translations[language]['error_agreement_not_checked'];
      agreementError.setAttribute('data-translate', 'error_agreement_not_checked');
      isValid = false;
    } else {
      agreementError.textContent = '';
      agreementError.removeAttribute('data-translate');
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
    passwordError.removeAttribute('data-translate');
    confirmPasswordError.textContent = '';
    confirmPasswordError.removeAttribute('data-translate');

    validateForm();
  });

  copyPasswordBtn.addEventListener('click', function() {
    const language = localStorage.getItem('language') || 'ru';
    navigator.clipboard.writeText(generatedPasswordDisplay.textContent)
      .then(() => {
        alert(translations[language]['notification_password_copied']);
      })
      .catch(err => console.error('Copy error: ', err));
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
        nicknameInput.placeholder = translations[localStorage.getItem('language') || 'ru']['nickname_placeholder'] || 'Enter your nickname';
      }

      nicknameError.textContent = '';
      nicknameError.removeAttribute('data-translate');
      validateForm();
    }
  });

  nicknameInput.addEventListener('input', async function() {
    const language = localStorage.getItem('language') || 'ru';
    if (nicknameInput.value) {
      await checkFieldUniqueness('nickname', nicknameInput.value, nicknameError, 'error_nickname_taken');
    } else {
      nicknameError.textContent = '';
      nicknameError.removeAttribute('data-translate');
    }
    validateForm();
  });

  emailInput.addEventListener('input', async function() {
    const language = localStorage.getItem('language') || 'ru';
    const emailErrorMsg = validateEmail(emailInput.value);
    emailError.textContent = emailErrorMsg ? translations[language][emailErrorMsg] : '';
    emailError.setAttribute('data-translate', emailErrorMsg || '');

    if (!emailErrorMsg && emailInput.value) {
      await checkFieldUniqueness('email', emailInput.value, emailError, 'error_email_taken');
    }
    validateForm();
  });

  phoneInput.addEventListener('input', async function() {
    const language = localStorage.getItem('language') || 'ru';
    const phoneErrorMsg = validatePhone(phoneInput.value);
    phoneError.textContent = phoneErrorMsg ? translations[language][phoneErrorMsg] : '';
    phoneError.setAttribute('data-translate', phoneErrorMsg || '');

    if (!phoneErrorMsg && phoneInput.value) {
      await checkFieldUniqueness('phone', phoneInput.value, phoneError, 'error_phone_taken');
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
          console.log('Redirecting to /aut.html');
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
          console.error('Server error:', errorData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  loadUsers();
  generateNicknameBtn.click();
});