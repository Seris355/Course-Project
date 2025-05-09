let mask = document.querySelector('.mask');

window.addEventListener('load', () => {
    setTimeout(() => {
        mask.classList.add('hide');
        setTimeout(() => {
            mask.remove();
        }, 600);
    }, 400)
})