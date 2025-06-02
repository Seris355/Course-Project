document.addEventListener('DOMContentLoaded', function() {
    const mediaContainer = document.getElementById("media-slider");
    const mediaImages = document.querySelectorAll(".media-image");
    const mediaVideo = document.getElementById("media-video");
    const randomBtn = document.getElementById("media-random-btn");
    const videoBtn = document.getElementById("media-video-btn");
    const playPauseIndicator = document.getElementById("media-play-pause");
    const audioFiles = [
        'gallery_sounds/sound1.mp3',
        'gallery_sounds/sound2.mp3',
        'gallery_sounds/sound3.mp3',
        'gallery_sounds/sound4.mp3',
        'gallery_sounds/sound5.mp3',
        'gallery_sounds/sound6.mp3',
        'gallery_sounds/sound7.mp3',
        'gallery_sounds/sound8.mp3',
        'gallery_sounds/sound9.mp3',
        'gallery_sounds/sound10.mp3'
    ];
    
    let currentMediaIndex = 0;
    let audioPlayer = new Audio();
    let currentMediaType = 'image'; 
    
    function initGallery() {
        showMedia(currentMediaIndex);
        randomBtn.addEventListener('click', showRandomImage);
        videoBtn.addEventListener('click', toggleVideo);
        const updateStatus = () => {
            const isPlaying = !audioPlayer.paused || (!mediaVideo.paused && mediaVideo.style.display === 'block');
            playPauseIndicator.textContent = isPlaying ? '⏸️' : '▶️';
            playPauseIndicator.title = isPlaying ? 'Сейчас играет' : 'Сейчас пауза';
        };
        
        audioPlayer.addEventListener('play', updateStatus);
        audioPlayer.addEventListener('pause', updateStatus);
        audioPlayer.addEventListener('ended', updateStatus);
        
        mediaVideo.addEventListener('play', updateStatus);
        mediaVideo.addEventListener('pause', updateStatus);
        mediaVideo.addEventListener('ended', updateStatus);
    }
    
    function showMedia(index) {
        currentMediaType = 'image';
    
        mediaVideo.style.display = 'none';
        mediaVideo.pause();
        
        mediaImages.forEach((img, i) => {
            if (i === index) {
                img.style.display = 'block';
                img.style.animation = 'fadeIn 0.5s ease-in-out';
            } else {
                img.style.display = 'none';
            }
        });
        
        playAudio(audioFiles[index]);
    }
    
    function showRandomImage() {
        if (currentMediaType === 'video') return;
        
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * mediaImages.length);
        } while (newIndex === currentMediaIndex && mediaImages.length > 1);
        
        currentMediaIndex = newIndex;
        showMedia(currentMediaIndex);
    }
    

    function toggleVideo() {
        if (currentMediaType === 'image') {
            currentMediaType = 'video';
            mediaImages.forEach(img => img.style.display = 'none');
            mediaVideo.style.display = 'block';
            mediaVideo.play().catch(e => console.error("Ошибка видео:", e));
            audioPlayer.pause();
        } else {
            currentMediaType = 'image';
            mediaVideo.pause();
            mediaVideo.style.display = 'none';
            showMedia(currentMediaIndex);
        }
    }
    
    function playAudio(src) {
        audioPlayer.pause();
        audioPlayer.src = src;
        audioPlayer.play().catch(e => console.error("Ошибка аудио:", e));
    }
    
    initGallery();
});