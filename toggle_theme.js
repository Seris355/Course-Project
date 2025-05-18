document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const LIGHT_THEME_CLASS = 'light-theme';
  const IS_DARK_KEY = 'IsDark';
  
  const isDark = localStorage.getItem(IS_DARK_KEY) !== 'false';
  
  if (!isDark) {
    document.body.classList.add(LIGHT_THEME_CLASS);
  }
  
  themeToggle.addEventListener('click', function() {
    const isCurrentlyDark = !document.body.classList.contains(LIGHT_THEME_CLASS);
    
    if (isCurrentlyDark) {
      document.body.classList.add(LIGHT_THEME_CLASS);
      localStorage.setItem(IS_DARK_KEY, 'false');
    } else {
      document.body.classList.remove(LIGHT_THEME_CLASS);
      localStorage.setItem(IS_DARK_KEY, 'true');
    }
  });
});