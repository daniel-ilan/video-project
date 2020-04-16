$(document).ready(function () {

    /*          ----            side-nav change color           ----            */
    $('.sideNavUl').click(
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
    sideBarNavItemHover();

    /* change the color of the selceted nav item */
    var path = window.location.pathname;
    var page = path.split("/").pop();
    $(`a[href='${page}']`).children().removeClass('svgFill');
    $(`a[href='${page}']`).children().addClass('svgFillActive');
    $(`a[href='${page}']`).addClass('active');
    $(`a[href='${page}']`).removeClass('text-white');
    $(`a[href='${page}']`).parent().addClass('activeNav');
    roundItemsBorder();


});



/* round the before and after nav items borders */
function roundItemsBorder() {
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

}

function sideBarNavItemHover() {
    $(".sidebar li").hover(
        function() {
            $( this).find('svg').addClass('svgFillHover');
            $( this).find('a').addClass('nav-linkHover');
            console.log( $( this).find('a'));


        }, function() {
            $( this).find('svg').removeClass('svgFillHover');
            $( this).find('a').removeClass('nav-linkHover');

        }
    );

}




