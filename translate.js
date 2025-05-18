function toggleLanguage() {
  const currentLanguage = localStorage.getItem("language") || "ru";
  const newLanguage = currentLanguage === "ru" ? "en" : "ru";
  
  localStorage.setItem("language", newLanguage);
  
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach(element => {
    const key = element.getAttribute("data-translate");
    if (translations[newLanguage] && translations[newLanguage][key]) {
      element.textContent = translations[newLanguage][key];
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("language") || "ru";
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach(element => {
    const key = element.getAttribute("data-translate");
    if (translations[savedLanguage] && translations[savedLanguage][key]) {
      element.textContent = translations[savedLanguage][key];
    }
  });
});