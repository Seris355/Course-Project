function toggleLanguage() {
  const currentLanguage = localStorage.getItem("language") || "ru";
  const newLanguage = currentLanguage === "ru" ? "en" : "ru";
  
  localStorage.setItem("language", newLanguage);
  
  const textElements = document.querySelectorAll("[data-translate]");
  textElements.forEach(element => {
    const key = element.getAttribute("data-translate");
    if (translations[newLanguage] && translations[newLanguage][key]) {
      element.textContent = translations[newLanguage][key];
    }
  });


  const placeholderElements = document.querySelectorAll("[data-translate-placeholder]");
  placeholderElements.forEach(element => {
    const key = element.getAttribute("data-translate-placeholder");
    if (translations[newLanguage] && translations[newLanguage][key]) {
      element.placeholder = translations[newLanguage][key];
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("language") || "ru";
  

  const textElements = document.querySelectorAll("[data-translate]");
  textElements.forEach(element => {
    const key = element.getAttribute("data-translate");
    if (translations[savedLanguage] && translations[savedLanguage][key]) {
      element.textContent = translations[savedLanguage][key];
    }
  });

  const placeholderElements = document.querySelectorAll("[data-translate-placeholder]");
  placeholderElements.forEach(element => {
    const key = element.getAttribute("data-translate-placeholder");
    if (translations[savedLanguage] && translations[savedLanguage][key]) {
      element.placeholder = translations[savedLanguage][key];
    }
  });
});