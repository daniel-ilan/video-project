


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

$(`a[href='${page}']`).children().removeClass('svgFill');
$(`a[href='${page}']`).children().addClass('svgFillActive');

$(`a[href='${page}']`).addClass('active');
$(`a[href='${page}']`).removeClass('text-white');






