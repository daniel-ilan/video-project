let editForm = "";
let boolX = false;

$(document).ready(function () {
    editForm = $('.main-container');
    $('.helpBtn').tooltip();

    var path = window.location.pathname;
    var page = path.split("/").pop();

    if (editForm.val() === "" && boolX === false) {
        boolX = true;

        $.ajax({
            method: 'POST',
            url: '/onLoad',
            data: {'page_name': page, event_kind: "pageLoad"}
        }).done(loadPageData);
    }
    $("#chooseFromReadyPalette").on('click', open_modal_handler);
    // $(".sidebarCol li a").on('click', change_animation_handler);

});

function loadPageData(data) {
    if (data.page_name == "" || data.page_name == "projectPage") {
        buildCollection(data)
        buildPalette(data.colors)
    }
}

function buildCollection(data) {
    let collection_nav = [];
    let collection_animation_area = []
    let numOfAnimations = ""

    for (i = 0; i < data.collections_props.length; i++) {
        let active_class = ""
        let numOfAnimations = ""
        if (data.selected_collection_id == data.collections_props[i][0]) {
            active_class = " activeCollection animated_zoomIn flipInY"
        }
        if (data.collection_id == data.collections_props[i][0]) {
            active_class += " selectedCollection"
            if (data.collections_props[i][0] != data.selected_collection_id) {
                numOfAnimations = `<span class="counterSpan counterSpanBG"> אוסף נבחר </span>`
                $("#selectCollection").removeClass("disabled");
                $("#selectCollection").off('click', disabledFunc);
                $("#selectCollection").on('click', change_collection_handler);
            } else {
                numOfAnimations = `<span class=" counterSpan "> אוסף נבחר </span>`
                $("#selectCollection").addClass("disabled");
                $("#selectCollection").on('click', disabledFunc);
                $("#selectCollection").off('click', change_collection_handler);
            }
        }
        let myLi = `<li id="${'li_' + data.collections_props[i][0]}" class="${active_class}">
                        <a id="${'a_' + data.collections_props[i][0]}" class="nav-link collection-nav" href="#">${data.collections_props[i][1] + numOfAnimations} </a>
                    </li>`;
        collection_nav.push(myLi);
    }
    $('#collection_nav').html(collection_nav);
    $("#collection_nav li a").on('click', change_collection_handler);

    //null when the animations exist and the user just change the collection on the db after click on "selectCollection"
    if (data.animations_props != null) {
        for (i = 0; i < data.animations_props[1].length; i++) {
            let source = data.animations_props[0] + data.animations_props[1][i][2];
            let animation = `<div class="frame_container_class">
        <div id="collectionAnimation_${data.animations_props[1][i][0]}" class="tinyLottie tinyLottie_Brand animated_zoomIn zoomIn">
            <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
                           speed="1"
                           style="" hover loop>
            </lottie-player>
        </div>
      <div class="form-check animated_zoomIn zoomIn">
            <input type="checkbox" class="form-check-input" id="animationCheck_${data.animations_props[1][i][0]}">
            <label class="form-check-label tinyLottieDescription" for="animationCheck_${data.animations_props[1][i][0]}">${data.animations_props[1][i][1]}</label>
        </div>
    </div>`;
            collection_animation_area.push(animation);
        }
        $('#collection_animation_area').html(collection_animation_area);
    }

    $('#totalAnimationCounter').html(data.collection_length);
    // plays all animations to 50%
    document.querySelectorAll(".tinyLottiePlayer").forEach(function seekToMiddle(player) {
        player.addEventListener("ready", function () {
            player.seek("50%");
        });
        player.addEventListener("stop", function () {
            player.seek("50%");
        });
    });
}

function change_collection_handler(event) {
    let event_kind = ""
    let col_id = ""
    if (event.currentTarget.classList.contains("collection-nav")) {
        event_kind = "switch_event";
        col_id = (event.currentTarget.id).slice(2);
    } else if (event.currentTarget.id == "selectCollection") {
        event_kind = "ChooseCollection";
        col_id = ($(".activeCollection")[0].id).slice(3);
    }
    $.ajax({
        method: 'POST',
        url: '/collectionChange',
        data: {
            'event_kind': event_kind,
            'col_id': col_id
        }
    }).done(buildCollection);
}


function change_palette_handler(event) {
    const spinner = $("#animSpinner");
    let event_kind = ""
    let pal_id = ""
    let colorId=""
    if (event.currentTarget.id == "modal_main_btn") {
        event_kind = "ChoosePaletteFromCollection";
        pal_id = ($(".paletteGrid_modal_Selected")[0].id).slice(16);
    }
    else if(event.currentTarget.classList.contains("brand_colors"))
    {
        event_kind = "ChangeColor";
        pal_id = event.value;
        colorId= event.currentTarget.getAttribute('dataId');
    }
    $.ajax({
        method: 'POST',
        url: '/PaletteHandler',
        data: {
            'event_kind': event_kind,
            'pal_id': pal_id,
            'colorId': colorId
        }
    }).done(buildPalette);
}

function disabledFunc(event) {
    if (event.currentTarget.classList.contains("disabled") || event.currentTarget.classList.contains("secondaryBtn_disabled")) {
        if (event.currentTarget.id == "selectCollection" && event.currentTarget.classList.contains("disabled")) {
            $("#selectCollection").off('click', disabledFunc);
            $("#selectCollection").on('click', change_collection_handler);

        }

        event.preventDefault();
        $("#" + event.currentTarget.id).addClass("animated_shake jello");
        setTimeout(function () {
            $("#" + event.currentTarget.id).removeClass("animated_shake jello");
        }, 3000);
    }
}

function buildPalette(data) {
    const spinner = $("#animSpinner");
    spinner.addClass("invisible");
    let colorArray = []
    let names = ["צבע ראשי", "צבע משני ", "צבע רקע", "צבע טקסט"]
    if (data.event_kind != null) {
        if (data.event_kind == "ChoosePaletteFromCollection") {
            data = data.colors
            $('#modal').modal('hide')
        } else if (data.event_kind == "ChangeColor") {
            data = data.colors
        }
    }
        for (i = 0; i < data.length; i++) {
            let color = `<div id=${"colorDiv_" + data[i][1]} dataId="${data[i][2]}" class=" color-wrapper brand_colors">
                  <input type="hidden"  name=${data[i][1]} class="form-control" value=${data[i][0]} />
                  <div id="color_${data[i][1]}"  class="name-of-color"></div>
                  <span class="color-edit-line" data-toggle="tooltip" data-placement="right" title="${names[i]}">
                        <span class="colorpicker-input-addon"><i class="colorUiBrand d-flex justify-content-center"></i></span>
                    </span>
            <span >${names[i]}</span>
            </div>`;
            colorArray.push(color);
        }
        $('#colors_area').html(colorArray);
        document.querySelectorAll(".brand_colors").forEach(function (event) {
            let id = "#" + event.id;
            addCustomColor(id)
        });
}


function addCustomColor(id) {
    $(id).colorpicker({
        customClass: 'colorpicker-2x',
        sliders: {
            saturation: {
                maxLeft: 160,
                maxTop: 160
            },
            hue: {
                maxTop: 160
            },
            alpha: {
                maxTop: 160
            }
        }
    });

    $(id).on('colorpickerHide', function (e) {
        change_palette_handler(e);
    });
}

function open_modal_handler(event) {
    let event_kind = ""

    $('#modal').modal('show')
    if (event.currentTarget.id == "chooseFromReadyPalette") {
        event_kind = "chooseFromReadyPalette"
        $.ajax({
            method: 'POST',
            url: '/get_all_palettes',
            data: {'event_kind': event_kind}
        }).done(modael_data);
    }
}

function modael_data(data) {
    let colors = [];
    let source;

    if (data.event_kind == "chooseFromReadyPalette") {
        //reset and set modal_main_btn listeners and class shake animation will play from disabledFunc
        $("#modal_main_btn").on('click', disabledFunc);
        $("#modal_main_btn").off('click', change_palette_handler);
        $("#modal_main_btn").removeClass("animated_shake jello");
        $("#modal_main_btn").addClass("disabled");

        let divGrids = `<p>ניתן לעבור עם העכבר על הפלטה לצפייה בפרטיה  </p>`;
        for (i = 0; i < data.colors.length; i++) {
            let colorPalette = ""
            let spaceDiv = ""
            let colorDesc_all = ""
            for (z = 0; z < data.colors[i][1].length; z++) {
                if (z < data.colors[i][1].length - 1) {
                    spaceDiv = `<hr class="solid">`;
                }
                let colorPaletteZ = `<div id="color_${data.colors[i][1][z][1]}" class="colorBranModal" style="background-color: ${data.colors[i][1][z][0]}"> </div>`;
                let colorDesc = `<div id=${"colorDiv_" + data.colors[i][0][0]} class="ml-2 colorBranModalDiv ">
                                        <div class="colorBranModal" style="background-color: ${data.colors[i][1][z][0]}"></div>
                                        <div>${data.colors[i][1][z][1]}</div>
                                 </div>`
                colorPalette += colorPaletteZ;
                colorDesc_all += colorDesc;
            }
            let divGrid = `<div id="gridLinePalette_${data.colors[i][0][0]}" class="row paletteGrid_modal mb-4">  
                            <div id="paletteArea_${data.colors[i][0][0]}" class="col-4">
                            <div class="d-flex flex-row "> ${colorPalette}</div>
                                    
                            </div>
                             <div class="col-8"> 
                             <div id="paletteDescription_${data.colors[i][0][0]}" style="display: none">
                                    <div class="d-flex flex-row">${colorDesc_all}</div></div>
                             </div>
                        </div>
                            ${spaceDiv}`;
            divGrids += divGrid;
        }
        $('.modal-title').text("בחירה מפלטות מוכנות");
        $('.modal-body').html(divGrids);


        //click on paletteGrid_modal
        let id_Clicked = ""
        $(".paletteGrid_modal").on("click", function () {
            current_id = this.id.slice(16);
            document.querySelectorAll(".paletteGrid_modal").forEach(function (event) {
                id = event.id.slice(16);
                if (id == current_id && event.classList.contains("paletteGrid_modal_Selected") != true) {
                    //add Selected class
                    $("#gridLinePalette_" + id).addClass("paletteGrid_modal_Selected");
                    id_Clicked = id;
                    //male btn sabled
                    $("#modal_main_btn").off('click', disabledFunc);
                    $("#modal_main_btn").on('click', change_palette_handler);
                    $("#modal_main_btn").removeClass("disabled");

                } else {
                    //remove Selected & Hover class
                    if (event.classList.contains("paletteGrid_modal_Selected")) {
                        $("#gridLinePalette_" + id).removeClass("paletteGrid_modal_Selected");
                    }
                    $("#paletteDescription_" + id).css("display", "none");
                }

            });
        });

        //Hover state for each paletteGrid_modal
        $(".paletteGrid_modal").hover(function () {
            //hover in
            current_id = this.id.slice(16);
            $("#paletteDescription_" + current_id).css("display", "block");
        }, function () {
            //hover out
            current_id = this.id.slice(16);
            if (current_id != id_Clicked) {
                $("#paletteDescription_" + current_id).css("display", "none");
            }
        });
    }
}

