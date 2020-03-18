
function changeAnimation(event) {
    const main_animation = document.querySelector('#mainAnimation');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        main_animation.load(event.currentTarget.src)
    };
    xhttp.open("POST", "/editTemplate", true);
    xhttp.send(event.currentTarget.src);

}


$(document).ready(function(){
    $(".sideNavUl").click(
        function (event) {
            $(this).find("a").forEach(
                function () {
                    if ($(this).find("a").hasClass('active')) {
                        $(this).removeClass('text-white');
                        $(this).find("svg").removeClass('svgFill');
                    }

                }
            )
        });
    var path = window.location.pathname;
    var page = path.split("/").pop();

    const nav_links = $("a[href='${page}']");
    nav_links.children().removeClass('svgFill');
    nav_links.children().addClass('svgFillActive');
    nav_links.addClass('active');
    nav_links.removeClass('text-white');

    const animation_templates = $('.animation-template');

    animation_templates.on('click', changeAnimation);
    // animation_templates.forEach(function () {
    //     $(this).addEventListener('click', changeAnimation(this, main_animation))
    // });
});






