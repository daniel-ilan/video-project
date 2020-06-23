import {roundItemsBorder} from "./RoundItemsBorder.js";

let editForm = "";
let boolX = false;

$(document).ready(function () {
    editForm = $('.main-container');
    $('.helpBtn').tooltip();

    if (editForm.val() === "" && boolX === false) {
        boolX = true;
       // loadPage("pageLoad");
        loadPage("link_videos");

    }
    $(".sidebarCol li a").on('click', function () {
        let id = event.currentTarget.id;
        loadPage(id)
    });

});

function loadPage(event_kind) {
    $.ajax({
        method: 'POST',
        url: '/onLoad',
        data: {event_kind: event_kind}
    }).done(loadPageData);
}


function loadPageData(data) {
    if (data.event_kind == "pageLoad" || data.event_kind == "link_brand") {
        buildBrandPage(data)
        changeNavItem(data.event_kind)
        buildCollection(data)
        buildPalette(data.colors)
    }
    else if(data.event_kind == "link_videos") {
        buildVideoPage(data)
        changeNavItem(data.event_kind)
    }
}

function buildCollection(data) {
    let collection_nav = [];
    let collection_animation_area = []
    let numOfAnimations = ""

    for (let i = 0; i < data.collections_props.length; i++) {
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
        for (let i = 0; i < data.animations_props[1].length; i++) {
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
    let colorId = ""
    if (event.currentTarget.id == "modal_main_btn") {
        event_kind = "ChoosePaletteFromCollection";
        pal_id = ($(".paletteGrid_modal_Selected")[0].id).slice(16);
    } else if (event.currentTarget.classList.contains("brand_colors")) {
        event_kind = "ChangeColor";
        pal_id = event.value;
        colorId = event.currentTarget.getAttribute('dataId');
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
    for (let i = 0; i < data.length; i++) {
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
        for (let i = 0; i < data.colors.length; i++) {
            let colorPalette = ""
            let spaceDiv = ""
            let colorDesc_all = ""
            for (let z = 0; z < data.colors[i][1].length; z++) {
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
            let current_id = this.id.slice(16);
            document.querySelectorAll(".paletteGrid_modal").forEach(function (event) {
                let id = event.id.slice(16);
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
            let current_id = this.id.slice(16);
            $("#paletteDescription_" + current_id).css("display", "block");
        }, function () {
            //hover out
            let current_id = this.id.slice(16);
            if (current_id != id_Clicked) {
                $("#paletteDescription_" + current_id).css("display", "none");
            }
        });
    }
}

function buildBrandPage() {
    const data = `   
       <div class="row h-5 container-fluid mr-4 pt-2">
        <h1 id="pageTitleH" class="mr-auto pt-1 pb-3 ">מותג</h1>
    </div>
   <div id="brandPageContainer" class="container-fluid mr-4" >
        <div class="h-60 pt-2">

            <div class="d-flex flex-row h2_projectPage">
                <svg viewBox="0 0 32 32" fill="svgFill" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.22222 12.2222H8.55556C9.22778 12.2222 9.77778 11.6722 9.77778 11V1.22222C9.77778 0.55 9.22778 0 8.55556 0H1.22222C0.55 0 0 0.55 0 1.22222V11C0 11.6722 0.55 12.2222 1.22222 12.2222ZM1.22222 22H8.55556C9.22778 22 9.77778 21.45 9.77778 20.7778V15.8889C9.77778 15.2167 9.22778 14.6667 8.55556 14.6667H1.22222C0.55 14.6667 0 15.2167 0 15.8889V20.7778C0 21.45 0.55 22 1.22222 22ZM13.4444 22H20.7778C21.45 22 22 21.45 22 20.7778V11C22 10.3278 21.45 9.77778 20.7778 9.77778H13.4444C12.7722 9.77778 12.2222 10.3278 12.2222 11V20.7778C12.2222 21.45 12.7722 22 13.4444 22ZM12.2222 1.22222V6.11111C12.2222 6.78333 12.7722 7.33333 13.4444 7.33333H20.7778C21.45 7.33333 22 6.78333 22 6.11111V1.22222C22 0.55 21.45 0 20.7778 0H13.4444C12.7722 0 12.2222 0.55 12.2222 1.22222Z"
                          fill="#2F1359"/>
                </svg>
                <h2>אוספים</h2>
                <button type="button" class="btn helpBtn" data-toggle="tooltip" data-placement="right"
                        title="בחלק זה ניתן להרכיב סט אנימציות, אנימציות אלו יבואו לידי ביטוי בפרויקט זה.
                               אך אין מה לדאוג, ניתן לשנות את האנימציות בכל שלב בפרויקט">
                    ?
                </button>
            </div>
            <div style="display: none">
                <div class="d-flex flex-row alert" >
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1C9.73889 1 10.4472 1.09444 11.125 1.28333C11.8083 1.47222 12.4472 1.74167 13.0417 2.09167C13.6361 2.43611 14.175 2.85278 14.6583 3.34167C15.1472 3.825 15.5639 4.36389 15.9083 4.95833C16.2583 5.55278 16.5278 6.19167 16.7167 6.875C16.9056 7.55278 17 8.26111 17 9C17 9.73889 16.9056 10.45 16.7167 11.1333C16.5278 11.8111 16.2583 12.4472 15.9083 13.0417C15.5639 13.6361 15.1472 14.1778 14.6583 14.6667C14.175 15.15 13.6361 15.5667 13.0417 15.9167C12.4472 16.2611 11.8083 16.5278 11.125 16.7167C10.4472 16.9056 9.73889 17 9 17C8.26111 17 7.55 16.9056 6.86667 16.7167C6.18889 16.5278 5.55278 16.2611 4.95833 15.9167C4.36389 15.5667 3.82222 15.15 3.33333 14.6667C2.85 14.1778 2.43333 13.6361 2.08333 13.0417C1.73889 12.4472 1.47222 11.8111 1.28333 11.1333C1.09444 10.45 1 9.73889 1 9C1 8.26111 1.09444 7.55278 1.28333 6.875C1.47222 6.19167 1.73889 5.55278 2.08333 4.95833C2.43333 4.36389 2.85 3.825 3.33333 3.34167C3.82222 2.85278 4.36389 2.43611 4.95833 2.09167C5.55278 1.74167 6.18889 1.47222 6.86667 1.28333C7.55 1.09444 8.26111 1 9 1ZM9 15.9333C9.63333 15.9333 10.2444 15.85 10.8333 15.6833C11.4278 15.5167 11.9806 15.2833 12.4917 14.9833C13.0083 14.6833 13.4778 14.3222 13.9 13.9C14.3222 13.4778 14.6833 13.0111 14.9833 12.5C15.2833 11.9833 15.5167 11.4306 15.6833 10.8417C15.85 10.2528 15.9333 9.63889 15.9333 9C15.9333 8.36667 15.85 7.75556 15.6833 7.16667C15.5167 6.57222 15.2833 6.01944 14.9833 5.50833C14.6833 4.99167 14.3222 4.52222 13.9 4.1C13.4778 3.67778 13.0083 3.31667 12.4917 3.01667C11.9806 2.71667 11.4278 2.48333 10.8333 2.31667C10.2444 2.15 9.63333 2.06667 9 2.06667C8.36111 2.06667 7.74722 2.15 7.15833 2.31667C6.56944 2.48333 6.01667 2.71667 5.5 3.01667C4.98889 3.31667 4.52222 3.67778 4.1 4.1C3.67778 4.52222 3.31667 4.99167 3.01667 5.50833C2.71667 6.01944 2.48333 6.57222 2.31667 7.16667C2.15 7.75556 2.06667 8.36667 2.06667 9C2.06667 9.63333 2.15 10.2472 2.31667 10.8417C2.48333 11.4306 2.71667 11.9833 3.01667 12.5C3.31667 13.0111 3.67778 13.4778 4.1 13.9C4.52222 14.3222 4.98889 14.6833 5.5 14.9833C6.01667 15.2833 6.56944 15.5167 7.15833 15.6833C7.74722 15.85 8.36111 15.9333 9 15.9333ZM8.46667 5.26667H9.53333V10H8.46667V5.26667ZM8.46667 11.6667H9.53333V12.7333H8.46667V11.6667Z"
                              fill="black" stroke="black" stroke-width="0.4"/>
                    </svg>
                    <span>לפרויקט המושלם עדיף להשתמש בעד 2 תבניות</span>
                </div>

            </div>

            <div id="collection_area" class="brandArea ">
                <div class="d-flex pb-3">
                    <div>
                        <ul id="collection_nav" class="nav">
                        </ul>
                    </div>
                    <div id="counterCollection" class="ml-auto align-self-center">אספת <span
                            id="totalAnimationCounter"></span> אנימציות במותגך
                    </div>
                </div>

                <div id="collection_animation_area">
                </div>

                <div class="d-flex float-right">
                    <input type="submit" name="submitChange" id="selectCollection"
                           class="disabled btn primaryBTN justify-content-center ml-auto align-self-center" value="בחירה"/>
                </div>
            </div>
        </div>
        <div class="row h-35 pt-2">
            <div class="container col">
                <div class="d-flex flex-row h2_projectPage">
                    <svg viewBox="0 0 32 32" fill="svgFill" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 0C5.82111 0 0 5.82111 0 13C0 20.1789 5.82111 26 13 26C14.1989 26 15.1667 25.0322 15.1667 23.8333C15.1667 23.27 14.95 22.7644 14.6033 22.3744C14.2711 21.9989 14.0544 21.4933 14.0544 20.9444C14.0544 19.7456 15.0222 18.7778 16.2211 18.7778H18.7778C22.7644 18.7778 26 15.5422 26 11.5556C26 5.17111 20.1789 0 13 0ZM5.05556 13C3.85667 13 2.88889 12.0322 2.88889 10.8333C2.88889 9.63444 3.85667 8.66667 5.05556 8.66667C6.25444 8.66667 7.22222 9.63444 7.22222 10.8333C7.22222 12.0322 6.25444 13 5.05556 13ZM9.38889 7.22222C8.19 7.22222 7.22222 6.25444 7.22222 5.05556C7.22222 3.85667 8.19 2.88889 9.38889 2.88889C10.5878 2.88889 11.5556 3.85667 11.5556 5.05556C11.5556 6.25444 10.5878 7.22222 9.38889 7.22222ZM16.6111 7.22222C15.4122 7.22222 14.4444 6.25444 14.4444 5.05556C14.4444 3.85667 15.4122 2.88889 16.6111 2.88889C17.81 2.88889 18.7778 3.85667 18.7778 5.05556C18.7778 6.25444 17.81 7.22222 16.6111 7.22222ZM20.9444 13C19.7456 13 18.7778 12.0322 18.7778 10.8333C18.7778 9.63444 19.7456 8.66667 20.9444 8.66667C22.1433 8.66667 23.1111 9.63444 23.1111 10.8333C23.1111 12.0322 22.1433 13 20.9444 13Z"
                              fill="#2F1359"/>
                    </svg>
                    <h2>פלטת צבעים</h2>
                    <button type="button" class="btn helpBtn" data-toggle="tooltip" data-placement="right"
                            title="בחלק זה יש להגדיר את הצבעים הגלובלים שברצונך להשתמש בפרויקט זה.
                                    צבעים אלו יבואו לידי ביטוי באנימציות ובתוכן אך הם אינם הצבעים היחידים">
                        ?
                    </button>
                </div>
                <div id="palette_area " class="brandArea ">
                    <div id="colors_area" class="d-flex flex-row">
                        <div class="spinner-wrapper invisible align-items-center d-flex justify-content-center" id="animSpinner">
                            <div class="spinner-border text-info" style="width: 3rem; height: 3rem;" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-row-reverse ml-auto">
                    <input type="submit" name="chooseFromReadyPalette" id="chooseFromReadyPalette"
                           class=" btn secondaryBtn  align-self-center " value="בחירה מפלטות מוכנות"/>
                    <input type="submit" name="submitChange" id="readyPalette"
                           class="secondaryBtn_disabled secondaryBtn btn align-self-center mr-2" value="דגימה מתמונה"/>
                </div>
            </div>
            <div class="container  col">
                <div class="d-flex flex-row h2_projectPage">
                    <svg viewBox="0 0 32 32" fill="svgFill" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0V4.4H6.84211V22H10.9474V4.4H17.7895V0H0ZM26 7.33333H13.6842V11.7333H17.7895V22H21.8947V11.7333H26V7.33333Z"
                              fill="#2F1359"/>
                    </svg>
                    <h2>סגנונות הטקסט</h2>
                    <button type="button" class="btn helpBtn" data-toggle="tooltip" data-placement="right"
                            title="בחלק זה יש להגדיר את סגנונות הטקסט הגלובלים שברצונך להשתמש בפרויקט זה.
                                    צבעים אלו יבואו לידי ביטוי באנימציות ובתוכן">
                        ?
                    </button>
                </div>
                <div id="textArea_area" class="brandArea ">
                    <p> בקרוב</p>
                </div>
            </div>
        </div>
    </div>`;
    $('#containerForData').html(data);
    $("#chooseFromReadyPalette").on('click', open_modal_handler);
    $('[data-toggle="tooltip"]').tooltip();
}

function buildVideoPage(data) {
    const videos_leangth = data.videos_props.length;
    let alertMessage = "";
    let videos_cards = []
    videos_cards.push(`<div id="newVideoBtn" class="video_sizes animated_zoomIn zoomIn secondaryBtn btn align-self-center mr-2 justify-content-center">
                                <div class="plus_icon_more">+</di>
                                <div style="font-size: 1vw;margin-top: 80%">
                                    הוספת 
                                    <br>
                                    סרטון חדש
                                </di>
                                
                        </div>`)
    if(data.showAlert == true)
    {
        alertMessage = `<div>
                            <div class="d-flex flex-row alert" >
                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 1C9.73889 1 10.4472 1.09444 11.125 1.28333C11.8083 1.47222 12.4472 1.74167 13.0417 2.09167C13.6361 2.43611 14.175 2.85278 14.6583 3.34167C15.1472 3.825 15.5639 4.36389 15.9083 4.95833C16.2583 5.55278 16.5278 6.19167 16.7167 6.875C16.9056 7.55278 17 8.26111 17 9C17 9.73889 16.9056 10.45 16.7167 11.1333C16.5278 11.8111 16.2583 12.4472 15.9083 13.0417C15.5639 13.6361 15.1472 14.1778 14.6583 14.6667C14.175 15.15 13.6361 15.5667 13.0417 15.9167C12.4472 16.2611 11.8083 16.5278 11.125 16.7167C10.4472 16.9056 9.73889 17 9 17C8.26111 17 7.55 16.9056 6.86667 16.7167C6.18889 16.5278 5.55278 16.2611 4.95833 15.9167C4.36389 15.5667 3.82222 15.15 3.33333 14.6667C2.85 14.1778 2.43333 13.6361 2.08333 13.0417C1.73889 12.4472 1.47222 11.8111 1.28333 11.1333C1.09444 10.45 1 9.73889 1 9C1 8.26111 1.09444 7.55278 1.28333 6.875C1.47222 6.19167 1.73889 5.55278 2.08333 4.95833C2.43333 4.36389 2.85 3.825 3.33333 3.34167C3.82222 2.85278 4.36389 2.43611 4.95833 2.09167C5.55278 1.74167 6.18889 1.47222 6.86667 1.28333C7.55 1.09444 8.26111 1 9 1ZM9 15.9333C9.63333 15.9333 10.2444 15.85 10.8333 15.6833C11.4278 15.5167 11.9806 15.2833 12.4917 14.9833C13.0083 14.6833 13.4778 14.3222 13.9 13.9C14.3222 13.4778 14.6833 13.0111 14.9833 12.5C15.2833 11.9833 15.5167 11.4306 15.6833 10.8417C15.85 10.2528 15.9333 9.63889 15.9333 9C15.9333 8.36667 15.85 7.75556 15.6833 7.16667C15.5167 6.57222 15.2833 6.01944 14.9833 5.50833C14.6833 4.99167 14.3222 4.52222 13.9 4.1C13.4778 3.67778 13.0083 3.31667 12.4917 3.01667C11.9806 2.71667 11.4278 2.48333 10.8333 2.31667C10.2444 2.15 9.63333 2.06667 9 2.06667C8.36111 2.06667 7.74722 2.15 7.15833 2.31667C6.56944 2.48333 6.01667 2.71667 5.5 3.01667C4.98889 3.31667 4.52222 3.67778 4.1 4.1C3.67778 4.52222 3.31667 4.99167 3.01667 5.50833C2.71667 6.01944 2.48333 6.57222 2.31667 7.16667C2.15 7.75556 2.06667 8.36667 2.06667 9C2.06667 9.63333 2.15 10.2472 2.31667 10.8417C2.48333 11.4306 2.71667 11.9833 3.01667 12.5C3.31667 13.0111 3.67778 13.4778 4.1 13.9C4.52222 14.3222 4.98889 14.6833 5.5 14.9833C6.01667 15.2833 6.56944 15.5167 7.15833 15.6833C7.74722 15.85 8.36111 15.9333 9 15.9333ZM8.46667 5.26667H9.53333V10H8.46667V5.26667ZM8.46667 11.6667H9.53333V12.7333H8.46667V11.6667Z"
                                          fill="black" stroke="black" stroke-width="0.4"/>
                                </svg>
                                <span>הסרטונים יהיו במיתוג ברירת המחדל מאחר ולא הוגדר מיתוג</span>
                            </div>
                        </div>  `
    }

    for (let i = 0; i < videos_leangth; i++) {
        let className = ""
        if (data.videos_props[i][3] == "בהכנה")
        {
            className= "status_working"
        }
        else if (data.videos_props[i][3] == "בצילום")
        {
            className= "status_recording"
        }
        else if (data.videos_props[i][3] == "הסתיים")
        {
            className= "status_done"
        }
        let myCard = `  <div id="video_${data.videos_props[i][0]}" class="card animated_zoomIn zoomIn video_sizes">
                            <div class="img_wrapper">
                                  <img class="card-img-top" src="${"../"+data.video_src + data.videos_props[i][0] +"/" + data.videos_props[i][2].replace(/\u200f/g, '')}" alt="Card image cap">
                            </div>
                            <div class="card-body">
                            <div class="flex-wrap">
                                <h5 class="card-title p-2">${data.videos_props[i][1]}</h5>
                                <svg class="more_actions_card" style=" float: left; margin-top: -2rem;" width="9" height="6" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.31084 0.815816C8.21522 0.728061 8.06836 0.728061 7.97275 0.815816L4.5 4.00313L1.02725 0.815816C0.931641 0.728061 0.784777 0.728061 0.689164 0.815816L0.330955 1.14458C0.279366 1.19193 0.25 1.25874 0.25 1.32877C0.25 1.39879 0.279366 1.4656 0.330955 1.51295L4.33095 5.18418C4.42657 5.27194 4.57343 5.27194 4.66905 5.18418L8.66905 1.51295C8.72063 1.4656 8.75 1.39879 8.75 1.32877C8.75 1.25874 8.72063 1.19193 8.66905 1.14458L8.31084 0.815816Z" fill="#828282" stroke="#828282" stroke-width="0.5" stroke-linejoin="round"/>
                                </svg>
                            
                            </div>
                                  <small class="text-muted status ${className}">${data.videos_props[i][3]}</small>
                            </div>
                        </div>`;
        videos_cards.push(myCard);
    }

    const initial = `   
       <div class="row h-5 container-fluid mr-4 pt-2">
        <h1 id="pageTitleH" class="mr-auto pt-1 pb-3 ">סרטונים  <span id="videos_length_page"> ${"(" + videos_leangth + ")"}</span></h1>
    </div>
   <div id="videosPageContainer" class="container-fluid mr-4  pt-2" >
   ${alertMessage}
                      <div class="card-group">
 
                    </div>
    </div>`;
    $('#containerForData').html(initial);
    $('.card-group').html(videos_cards);
    $('#newVideoBtn').on("click",createNewVideo)
}

function changeNavItem(event_kind) {

    /* change the color of the selceted nav item */
    var indexActive = 1;

    let id = ""
    if (event_kind == "pageLoad") {
        id = "link_brand"
    }
    else  {
        id = event_kind;
    }
    $('.sidebar a').each(
        function () {
            if ($(this).attr('id') == id) {
                $(this).parent().addClass('animated fadeInLeft');
                $(this).addClass('animated fadeInLeft');

                $(this).children().removeClass('svgFill');
                $(this).children().addClass('svgFillActive');
                $(this).addClass('active');
                $(this).removeClass('text-white');
                $(this).parent().addClass('activeNav');

            } else {
                if ($(this).hasClass('active')) {
                    $(this).removeClass('animated fadeInLeft');
                    $(this).parent().removeClass('animated fadeInLeft');
                    $(this).removeClass('text-white');
                    $(this).children().removeClass('svgFillActive');
                    $(this).children().addClass('svgFill');
                    $(this).removeClass('active');
                    $(this).parent().removeClass('activeNav');


                    $(".sidebar li:nth-child(" + (indexActive).toString() + ")").removeClass('upNavUI');
                    $(".sidebar li:nth-child(" + (indexActive + 2).toString() + ")").removeClass('downNavUI');
                }
            }
            indexActive++;
        }
    );
    roundItemsBorder();

    /*
    if (kind == "empty") {
        $('#button_switch').addClass("secondaryBtn_disabled");
        $('#button_switch').on('click', disabledFunc);
        $("#button_switch").off('click', open_modal_handler);
    } else {
        $('#button_switch').removeClass("secondaryBtn_disabled");
        $('#button_switch').on('click', open_modal_handler);
        $("#button_switch").off('click', disabledFunc);
    }*/
}

function createNewVideo(event) {
    const event_kind = event.currentTarget.id;
    $.ajax({
        method: 'POST',
        url: '/createNewVideo',
        data: {
            'event_kind': event_kind
        }
    }).done(moveToPage);
}

function moveToPage(data)
{
    if (data.event_kind== "newVideoBtn")
    {
        window.location.href = "editContent";

    }
}
