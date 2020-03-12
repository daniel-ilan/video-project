var animation = bodymovin.loadAnimation({
    container: document.getElementById('bm'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../static/content/test1.json'
});

var animation2 = bodymovin.loadAnimation({
    container: document.getElementById('temp1'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../static/content/temp1.json'
});


var animation3 = bodymovin.loadAnimation({
    container: document.getElementById('temp2'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: '../static/content/temp2.json'
});

$('#temp2').click(function(){
    animation3.stop();
alert()
});


/*
//Even when targeting the ID only, it still plays all animations
$('#temp2').mouseenter(function(){
    var bodymovin_data = $(this).value;
    bodymovin.play(bodymovin_data);
});

$('#temp2').mouseleave(function(){
    var bodymovin_data = $(this).value;
console.log(bodymovin_data);
    bodymovin.pause(bodymovin_data);
});
*/


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






