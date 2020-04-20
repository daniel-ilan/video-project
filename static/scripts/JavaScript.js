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


    $('#minMenu').click(
        function (event) {
            sideBarDisplaySpanNone();
        });
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
        function () {
            $(this).find('svg').addClass('svgFillHover');
            $(this).find('a').addClass('nav-linkHover');
        }, function () {
            $(this).find('svg').removeClass('svgFillHover');
            $(this).find('a').removeClass('nav-linkHover');

        }
    );
}

let active_mini = false

function sideBarDisplaySpanNone() {
    $(".sidebar li span").each(function () {
        $(this).toggle();
    });
    if (active_mini == 0) {
        rotateImage("#logo", 90);
        rotateImage("#minMenu", 180);

        $("#logo_herf").addClass('mini_logo');

        $(".sidebarCol").addClass('sidebarCol_mini');
        $(".sidebarCol").removeClass('col-md-1');
        $(".sidebarCol").removeClass('col-lg-1');
        $('.sidebarCol').removeClass('ml-sm-auto');

        $("main").addClass('main_mini');
        $("main").removeClass('col-md-11');
        $("main").removeClass('col-lg-11 ');
        $('main').removeClass('ml-sm-auto');

        $('#minMenu').removeClass('minMenu_Big');
        $('#minMenu').addClass('minMenu_mini');
        active_mini = true;
    } else {
        rotateImage("#logo", 2);
        rotateImage("#logo", 0);
        rotateImage("#minMenu", 0);

        $("#logo_herf").removeClass('mini_logo');

        $(".sidebarCol").removeClass('sidebarCol_mini');
        $(".sidebarCol").addClass('col-md-1');
        $(".sidebarCol").addClass('col-lg-1');
        $('.sidebarCol').addClass('ml-sm-auto');

        $('#minMenu').addClass('minMenu_Big');
        $('#minMenu').removeClass('minMenu_mini');
        $("main").removeClass('main_mini');
        $("main").addClass('col-md-11');
        $("main").addClass('col-lg-11 ');
        $('main').addClass('ml-sm-auto');
        active_mini = false;
    }
}

function rotateImage(id, degree) {
    $(id).animate({transform: degree}, {
        step: function (now, fx) {
            $(this).css({
                '-webkit-transform': 'rotate(' + now + 'deg)',
                '-moz-transform': 'rotate(' + now + 'deg)',
                'transform': 'rotate(' + now + 'deg)'
            });
        }
    });
}


