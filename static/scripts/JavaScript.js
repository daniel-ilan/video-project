$(document).ready(function () {
    /*          ----            side-nav change color           ----            */
    var path = window.location.pathname;
    var page = path.split("/").pop();
    $(`a[href='${page}']`).children().removeClass('svgFill');
    $(`a[href='${page}']`).children().addClass('svgFillActive');

    $(`a[href='${page}']`).addClass('active');
    $(`a[href='${page}']`).parent().addClass('activeNav');

    var indexActive = 0;
    var counter = 0;
    $(".sidebar li").each(function () {
        counter++;
        if ($(this).hasClass('activeNav')) {
            indexActive = counter;
        }
    });
    $(".sidebar li:nth-child(" + (indexActive - 1).toString() + ")").addClass('upNavUI');
    $(".sidebar li:nth-child(" + (indexActive + 1).toString() + ")").addClass('downNavUI');


    /*          ----            change animation - editTemplate           ----            */
    const animation_templates = $('.tinyLottiePlayer');
    animation_templates.on('click', changeAnimation);
});

function changeAnimation(event) {
    const main_animation = document.querySelector('#mainAnimation');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        main_animation.load(event.currentTarget.src)
    };
    xhttp.open("POST", "/editTemplate", true);
    xhttp.send(event.currentTarget.src);

}




