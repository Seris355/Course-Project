document.addEventListener('DOMContentLoaded', () => {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    const colorSchemeButtons = document.querySelectorAll('.color-scheme-btn');
    const toggleImagesButton = document.querySelector('.toggle-images');
    const toggleMenuButton = document.querySelector('.toggle-menu');
    const closeMenuButton = document.querySelector('.close-btn');
    const menu = document.querySelector('.menu');
    let imagesVisible = true;

    fontSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.classList.remove('font-small', 'font-medium', 'font-large');
            document.body.classList.add(`font-${button.dataset.size}`);
        });
    });

    colorSchemeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.body.classList.remove('scheme-black-white', 'scheme-black-green', 'scheme-white-black');
            document.body.classList.add(`scheme-${button.dataset.scheme}`);
        });
    });

    toggleImagesButton.addEventListener('click', () => {
        imagesVisible = !imagesVisible;
        document.body.classList.toggle('no-images', !imagesVisible);
        toggleImagesButton.textContent = imagesVisible ? 'Отключить изображения' : 'Включить изображения';
    });

    toggleMenuButton.addEventListener('click', () => {
        menu.classList.add('active');
        document.body.classList.add('no-scroll');
    });

    closeMenuButton.addEventListener('click', () => {
        menu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    menu.addEventListener('click', (event) => {
        if (event.target === menu) {
            menu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
});