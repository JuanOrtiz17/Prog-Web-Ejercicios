        var video = document.getElementById('carouselVideo');
        var image = document.getElementById('carouselImage');
        var timeoutId;
        var carouselElement = document.getElementById('carouselExampleCaptions');
        var carousel = new bootstrap.Carousel(carouselElement, {
            interval: false  
        });

        function showVideo() {
            image.style.opacity = '0'; 
            video.style.display = 'block';
            setTimeout(function() {
                video.style.opacity = 1; 
            }, 30); 
            video.play();
            
        }

        function startVideoTimer() {
            timeoutId = setTimeout(showVideo, 3000);  
        }

        document.getElementById('carouselExampleCaptions').addEventListener('slid.bs.carousel', function () {
            video.style.opacity = '0'; 
            video.pause();
            video.currentTime = 0; 

            if (document.querySelector('.carousel-item.active') === document.querySelector('.carousel-item:first-child')) {
                setTimeout(function() {
                    image.style.opacity = '1'; 
                    video.style.display = 'none'; 
                }, 500);
                clearTimeout(timeoutId); 
                startVideoTimer(); 
            } else {
                image.style.opacity = '1';   
            }
        });

        window.onload = function() {
            image.style.opacity = '1';  
            video.style.display = 'none';    
            startVideoTimer();  
        };
 
    var video = document.getElementById('carouselVideo');
    var volumeButton = document.getElementById('volumeButton');
    var volumeIcon = volumeButton.querySelector('i');

    function toggleVolume() {
        if (video.muted) {
            video.muted = false;  
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-high'); 
        } else {
            video.muted = true; 
            volumeIcon.classList.remove('fa-volume-high');
            volumeIcon.classList.add('fa-volume-mute');  
        }
    }

    volumeButton.addEventListener('click', toggleVolume);