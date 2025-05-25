document.getElementById('header-container').innerHTML = `
    <div class="h_items">
        <a href="https://www.instagram.com/" class="inst_link"><img src="/images_foote_header/insta.svg" alt="instagram link" class="header_inst"></a>
        
        <nav class="h_nav">
            <a href="/main_page/main.html" class="hn_link" data-translate="nav_main">Главная</a>
            <a href="/our_team_page/our_team.html" class="hn_link" data-translate="nav_masters">Мастера</a>
            <a href="/service_page/service.html" class="hn_link" data-translate="nav_haircuts">Стрижки</a>
        </nav>

        ${isAdmin() ? 
            `<a href="/shop_admin/shop_admin.html" class="logo_header_link"><img src="/images_foote_header/logo.svg" alt="logo picture" class="logo_header"></a>` : 
            `<img src="/images_foote_header/logo.svg" alt="logo picture" class="logo_header">`}

        <nav class="h_nav">
            <a href="/shop_page/shop.html" class="hn_link" data-translate="nav_catalog">Каталог</a>
            <a href="/busket_page/busket.html" class="hn_link" data-translate="nav_cart">Корзина</a>
            <a href="/contact_page/contact.html" class="hn_link" data-translate="nav_contacts">Контакты</a>
        </nav>
        <a href="/registration_authorization_page/aut.html" class="header_profile_icon_link"><img src="/images_foote_header/log-out.svg" alt="logo picture" class="header_profile_icon"></a>
        
        <div class="burger_container" id="delet">
            <input type="checkbox" id="burger_toggle_id" class="burger_toggle">
            
            <label for="burger_toggle_id" class="burger">
                <span class="first_b"></span>
                <span class="second_b"></span>
                <span class="third_b"></span>
            </label>
        
            <div class="burger_dropdown">
                <div class="dropdown_item">
                    <a href="/main_page/main.html" class="hn_link_active" data-translate="nav_main">Главная</a>
                </div>
                <div class="dropdown_item">
                    <a href="/our_team_page/our_team.html" class="hn_link" data-translate="nav_masters">Мастера</a>
                </div>
                <div class="dropdown_item">
                    <a href="/service_page/service.html" class="hn_link" data-translate="nav_haircuts">Стрижки</a>
                </div>
                <div class="dropdown_item">
                    <a href="/shop_page/shop.html" class="hn_link" data-translate="nav_catalog">Каталог</a>
                </div>
                <div class="dropdown_item">
                    <a href="/contact_page/contact.html" class="hn_link" data-translate="nav_contacts">Контакты</a>
                </div>
                <div class="dropdown_item">
                    <a href="/busket_page/busket.html" class="hn_link" data-translate="nav_cart">Корзина</a>
                </div>
            </div>
        </div>
    </div>
    <div class="header_second_line">
      <nav class="h_nav_2">
            <button class="language-toggle" onclick="resetSettings()" aria-label="Toggle language">
                 <img src="/images_foote_header/refresh-cw.svg" alt="reset configuration" class="h_2nd">
            </button>
            <a href="/blind_page/blind.html" class=""><img src="/images_foote_header/eye.svg" alt="icon blind" class="h_2nd"></a>
            <button class="language-toggle" onclick="toggleLanguage()" aria-label="Toggle language">
                <img src="/images_foote_header/globe.svg" alt="translate" class="h_2nd">
            </button>
            <a href="/registration_authorization_page/aut.html" class="header_profile_icon_2_link"><img src="/images_foote_header/log-out.svg" alt="logo picture" class="h_2nd"></a>
            <img src="/images_foote_header/sun-moon.svg" alt="Toggle theme" class="h_2nd theme-toggle" id="theme-toggle">
            <a href="/favorite_page/favorite.html" class="" id="delet"><img src="/images_foote_header/heart.svg" alt="favorite" class="h_2nd" ></a>
        </nav>
    </div>
    <hr>
`;

document.getElementById('footer-container').innerHTML = `
    <hr>
    <ul class="f_list">
        <li class="logo_footer" id="delet"><a href="/main_page/main.html"><img src="/images_foote_header/logo2.svg" alt="logo footer" class="footer_logo"></a></li>
        <li>
            <h2 data-translate="footer_contacts">Контакты</h2>
            <div class="footer_phone_flex_error">
                <a href="#" class="fn_link" data-translate="footer_phone_1">+7 (812) 123-45-67</a>
                <a href="#" class="fn_link" data-translate="footer_phone_2">+7 (911) 123-45-67</a>
            </div>
            <p data-translate="footer_address">Новоостровский проспект, дом 36 лит.</p>
        </li>
        <li>
            <h2 data-translate="footer_hours">Режим работы</h2>
            <p data-translate="footer_hours_weekdays">C 10:00 до 21:00 (Пн-Пт)</p>
            <p data-translate="footer_hours_weekends">С 11:00 до 20:00 (Сб-Вс)</p>
        </li>
        <li>
            <h2 data-translate="footer_instagram">Мы в Instagram</h2>
            <a href="#" class="fi_link"><img src="/images_foote_header/insta2.svg" alt="instagram icon" class="footer_inst"></a>
        </li>
    </ul>
    <hr>
    <p class="footer_copy" data-translate="footer_copyright">Copyright © 2017 - 2022</p>
`;

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.nickname === 'admin' && currentUser.password === 'admin';
}

function resetSettings() {
    localStorage.setItem("language", "ru");
    localStorage.setItem("IsDark", "true");
    document.body.classList.remove("light-theme");
    const textElements = document.querySelectorAll("[data-translate]");
    textElements.forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations["ru"] && translations["ru"][key]) {
            element.textContent = translations["ru"][key];
        }
    });
    const placeholderElements = document.querySelectorAll("[data-translate-placeholder]");
    placeholderElements.forEach(element => {
        const key = element.getAttribute("data-translate-placeholder");
        if (translations["ru"] && translations["ru"][key]) {
            element.placeholder = translations["ru"][key];
        }
    });
}