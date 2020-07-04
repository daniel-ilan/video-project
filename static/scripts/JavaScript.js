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


    $('#minMenu').click(
        function (event) {
            sideBarDisplaySpanNone();
        });
});



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
    var path = window.location.pathname;
    var page = path.split("/").pop();

    $(".sidebar li span").each(function () {
        $(this).toggle();
    });
    if (active_mini == 0) {
        // mini side-bar
        // rotateImage("#logo", 90);
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

        if( page == "editContent"){
            // editContent - page
            $('#minMenu').addClass('minMenu_mini_EditPage');
            $('#user_area_sidenav').addClass('user_area_sidenav_mini_videoPage');
        }
        else
        {
            // projectPage - page and in the future -homePage
            $('#create_new_vid').html("+");
            $('#create_new_vid').addClass("rounded-circle");
            $('#create_new_vid').addClass("button_new_mini");
            rotateImage('#small_status', 90);
            $('#small_status').css("margin", "4vh 0");
            $('#sidenav_img').addClass("sidenav_img_mini");
            $('#project_name').css("display", "none");

        }
        active_mini = true;
        $('#minMenu').attr("data-state","true");
        $('#user_area_sidenav').addClass('user_area_sidenav_mini');


    } else {
        //full side bar
        // rotateImage("#logo", 2);
        // rotateImage("#logo", 0);
        rotateImage("#minMenu", 0);

        $("#logo_herf").removeClass('mini_logo');

        $(".sidebarCol").removeClass('sidebarCol_mini');
        $(".sidebarCol").addClass('col-md-1');
        $(".sidebarCol").addClass('col-lg-1');
        $('.sidebarCol').addClass('ml-sm-auto');

        $('#minMenu').addClass('minMenu_Big');
        $('#minMenu').removeClass('minMenu_mini');
        $("main").removeClass('main_mini');
        if( page == "editContent"){
            // editContent - page
            $('#minMenu').removeClass('minMenu_mini_EditPage');
            $('#user_area_sidenav').removeClass('user_area_sidenav_mini_videoPage');
        }
        else
        {
            // projectPage - page and in the future -homePage
            $('#create_new_vid').html("+ סרטון חדש");
            $('#create_new_vid').removeClass("rounded-circle");
            $('#create_new_vid').removeClass("button_new_mini");
            rotateImage('#small_status', 2);
            rotateImage('#small_status', 0);
            $('#small_status').css("margin", " 0 auto");

            $('#sidenav_img').removeClass("sidenav_img_mini");
            $('#project_name').css("display", "block");




        }
        $("main").addClass('col-md-11');
        $("main").addClass('col-lg-11 ');
        $('main').addClass('ml-sm-auto');
        active_mini = false;
        $('#minMenu').attr("data-state","false");
        $('#user_area_sidenav').removeClass('user_area_sidenav_mini');

    }
    roundItemsBorder()
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

function roundItemsBorder() {
    var indexActive = 0;
    var counter = 0;
    $(".sidebar li").each(function () {
        counter++;
        if ($(this).hasClass('activeNav')) {
            indexActive = counter;
        }
    });
    if( $('#minMenu').attr("data-state") == "false")
    {
        $(".sidebar li:nth-child(" + (indexActive - 1).toString() + ")").addClass('upNavUI');
        $(".sidebar li:nth-child(" + (indexActive + 1).toString() + ")").addClass('downNavUI');
        $(".sidebar li:nth-child(" + (indexActive).toString() + ")").removeClass('activeNav_mini');

    }
    else
    {
        $(".sidebar li:nth-child(" + (indexActive - 1).toString() + ")").addClass('upNavUI_mini');
        $(".sidebar li:nth-child(" + (indexActive + 1).toString() + ")").addClass('downNavUI_mini');
        $(".sidebar li:nth-child(" + (indexActive).toString() + ")").addClass('activeNav_mini');

    }

}


