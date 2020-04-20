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
            console.log($(this).find('a'));


        }, function () {
            $(this).find('svg').removeClass('svgFillHover');
            $(this).find('a').removeClass('nav-linkHover');

        }
    );
}

var x = 0

function sideBarDisplaySpanNone() {
    $(".sidebar li span").each(function () {
        $(this).toggle();
    });
    if (x == 0) {
        rotateImage("#logo",90);
        rotateImage("#minMenu",180);

        $("#logo_herf").addClass('mini_logo');

        $(".sidebarCol").addClass('sidebarCol_mini');
        $(".sidebarCol").removeClass('col-md-1');
        $(".sidebarCol").removeClass('ml-sm-auto');
        $(".sidebarCol").removeClass('col-lg-1');

        $('#minMenu').removeClass('minMenu_Big');
        $('#minMenu').addClass('minMenu_mini');

        $('main').removeClass('ml-sm-auto');
        x = 1;
    } else {
        rotateImage("#logo",2);
        rotateImage("#logo",0);
        rotateImage("#minMenu",0);

        $("#logo_herf").removeClass('mini_logo');

        $(".sidebarCol").removeClass('sidebarCol_mini');
        $(".sidebarCol").addClass('col-md-1');
        $(".sidebarCol").addClass('ml-sm-auto');
        $(".sidebarCol").addClass('col-lg-1');

        $('#minMenu').addClass('minMenu_Big');
        $('#minMenu').removeClass('minMenu_mini');
        $('main').addClass('ml-sm-auto');
        x = 0;
    }
}

function rotateImage(id,degree) {
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


