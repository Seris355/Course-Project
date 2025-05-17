
document.getElementById('header-container').innerHTML = `
    <div class="h_items">
        <a href="https://www.instagram.com/" class="inst_link"><img src="/images_foote_header/insta.svg" alt="instagram link" class="header_inst"></a>
        
        <nav class="h_nav">
            <a href="/main_page/main.html" class="hn_link_active">Главная</a>
            <a href="/our_team_page/our_team.html" class="hn_link">Мастера</a>
            <a href="/service_page/service.html" class="hn_link">Стрижки</a>
        </nav>

        ${isAdmin() ? 
            `<a href="/shop_admin/shop_admin.html" class="logo_header_link"><img src="/images_foote_header/logo.svg" alt="logo picture" class="logo_header"></a>` : 
            `<img src="/images_foote_header/logo.svg" alt="logo picture" class="logo_header">`}

        <nav class="h_nav">
            <a href="/shop_page/shop.html" class="hn_link">Каталог</a>
            <a href="/busket_page/busket.html" class="hn_link">Корзина</a>
            <a href="/contact_page/contact.html" class="hn_link">Контакты</a>
        </nav>
            <a href="/registration_authorization_page/aut.html" class="header_profile_icon_link"><img src="/images_foote_header/log-out.svg" alt="logo picture" class="header_profile_icon"></a>
            
        <div class="burger_container">
            <input type="checkbox" id="burger_toggle_id" class="burger_toggle">
            
            <label for="burger_toggle_id" class="burger">
                <span class="first_b"></span>
                <span class="second_b"></span>
                <span class="third_b"></span>
            </label>
        
            <div class="burger_dropdown">
                <div class="dropdown_item">
                    <a href="/main_page/main.html" class="hn_link_active">Главная</a>
                </div>
                <div class="dropdown_item">
                    <a href="/our_team_page/our_team.html" class="hn_link">Мастера</a>
                </div>
                <div class="dropdown_item">
                    <a href="/service_page/service.html" class="hn_link">Стрижки</a>
                </div>
                <div class="dropdown_item">
                    <a href="/shop_page/shop.html" class="hn_link">Каталог</a>
                </div>
                <div class="dropdown_item">
                    <a href="/contact_page/contact.html" class="hn_link">Контакты</a>
                </div>
                <div class="dropdown_item">
                    <a href="/busket_page/busket.html" class="hn_link">Корзина</a>
                </div>
            </div>
        </div>
    </div>
    <div class="header_second_line">
      <nav class="h_nav_2">
            <img src="/images_foote_header/eye.svg" alt="icon blind">
            <img src="/images_foote_header/globe.svg" alt="translate">
            <a href="/registration_authorization_page/aut.html" class="header_profile_icon_2_link"><img src="/images_foote_header/log-out.svg" alt="logo picture" class="header_profile_icon_2"></a>
            <img src="/images_foote_header/sun-moon.svg" alt="color change">
            <img src="/images_foote_header/heart.svg" alt="favorite">
        </nav>
    </div>
    <hr>
`;

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.nickname === 'admin' && currentUser.password === 'admin';
}

document.getElementById('footer-container').innerHTML = `
    <hr>
    <ul class="f_list">
        <li class="logo_footer"><a href="/main_page/main.html"><img src="/images_foote_header/logo2.svg" alt="logo footer"></a></li>
        <li>
            <h2>Контакты</h2>
            <div class="footer_phone_flex_error">
                <a href="#" class="fn_link">+7 (812) 123-45-67</a>
                <a href="#" class="fn_link">+7 (911) 123-45-67</a>
            </div>
            
            <p>Новоостровский проспект, дом 36 лит.</p>
        </li>
        <li>
            <h2>Режим работы</h2>
            <p>C 10:00 до 21:00 (Пн-Пт)</p>
            <p>С 11:00 до 20:00 (Сб-Вс)</p>
        </li>
        <li>
            <h2>Мы в Instagram</h2>
            <a href="#" class="fi_link"><img src="/images_foote_header/insta2.svg" alt="instagram icon" class="footer_inst"></a>
        </li>
    </ul>
    <hr>
    <p class="footer_copy">Copyright © 2017 - 2022</p>
    
`;