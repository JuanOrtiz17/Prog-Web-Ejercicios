function setupCarousel(wrapperId, leftId, rightId) {
    const carousel = document.querySelector(`#${wrapperId}`);
    const firstImg = carousel.querySelectorAll("img")[0];
    const leftIcon = document.getElementById(leftId);
    const rightIcon = document.getElementById(rightId);

    let firstImgWidth = firstImg.clientWidth + 10;
    let imagesToScroll = 7;

    leftIcon.addEventListener("click", () => {
        carousel.scrollLeft -= firstImgWidth * imagesToScroll;
    });

    rightIcon.addEventListener("click", () => {
        carousel.scrollLeft += firstImgWidth * imagesToScroll;
    });
}

setupCarousel("carousel1", "left1", "right1");
setupCarousel("carousel2", "left2", "right2");
