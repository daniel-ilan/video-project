$(document).ready(function () {
    const animation_templates = $('.tinyLottiePlayer');
    animation_templates.on('click', changeAnimation);

    function changeAnimation(event) {
        const main_animation = document.querySelector('#mainAnimation');
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            main_animation.load(event.currentTarget.src)
        };
        xhttp.open("POST", "/editTemplate", true);
        xhttp.send(event.currentTarget.src);
    }
});



