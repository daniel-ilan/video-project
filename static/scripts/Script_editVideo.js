let editForm = "";
let animProps = "";
let boolX = false;
let frameOrder = "";
let color_palettes_json = null;

$(document).ready(function () {
    // const editForm = $('#content');
    editForm = $('#content');
    if (editForm.val() === "" && boolX === false) {
        frameChangeHandler();
        boolX = true;
    }
    $(".sidebarCol li a").on('click', change_animation_handler);
});

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

function frameChangeHandler(event) {
    let event_kind = "";
    let frame_id = "";
    if (event == null) {
        event_kind = "onLoad"
    } else if (event.currentTarget.id === "dltFrameBtn") {
        event_kind = "delete_frame";
        frame_id = $(".active_frame_lottie")[0].id;
        event.preventDefault();
    } else if (event.currentTarget.id === "newFrameBtn") {
        event_kind = "new_frame"
    }
    const pageSpinner = $("#pageSpinner");
    pageSpinner.removeClass("invisible");
    $.ajax({
        method: 'POST',
        url: '/frame_change',
        data: {'event_kind': event_kind, 'frame_id': frame_id}
    }).done(buildFrames, contentChangeHandler);
}


function change_animation_handler(event) {
    let event_kind = "";
    let selected_kind = "";
    let form_data = "";
    const spinner = $("#animSpinner");
    let frame_id = $(".active_frame_lottie")[0].id;
    let order = document.querySelector('#'+frame_id).getAttribute("data-anim");
    spinner.removeClass("invisible");
    if (event.currentTarget.classList.contains("secondaryBtn_disabled")) {
        disabledFunc(event)
    } else {
        if (event.currentTarget.classList.contains("frame_lottie")) {
            event_kind = "frame_click";
            frame_id = event.currentTarget.id;
        } else if (event.currentTarget.classList.contains("nav-link")) {
            event_kind = "change_kind_click";
            selected_kind = (event.currentTarget.id).slice(5);

        } else if (event.currentTarget.id === "submitChange") {
            event_kind = "submitChange";
            event.preventDefault();
            form_data = [];
            $('#content input').each(function () {
                form_data.push([$(this).attr('name'), $(this).val()])
            });
            $('#content select').each(function () {
                form_data.push([$(this).attr('name'), $(this).val()])
            });
            $('#content textarea').each(function () {
                form_data.push([$(this).attr('name'), $(this).val()])
            });


        } else if (event.currentTarget.classList.contains("anim_kind")) {
            // change between two animation from the same kind and brand
            event_kind = "change_mini_lottie";
            // selected_kind in this function represent the selected mini anim for replace to
            selected_kind = event.currentTarget.id;
            //selected_kind = event.target.src;
        } else if (event.currentTarget.id === "modal_main_btn") {
            event_kind = "select_from_general";
            // selected_kind in this function represent the selected mini anim for replace to
            selected_kind = $('.active_from_general')[0].id;
            $('#modal').modal('hide')
        }


        // check if there is image upload input
        var is_imageUpload_file = false;
        for (var i = 0; i < form_data.length; i++) {
            if (form_data[i].includes("imageUpload_file")) {
                is_imageUpload_file = true;
            }
        }

        if (is_imageUpload_file) {
            //submit imageUpload_file

            /**
             * @param {event} eve
             * @fires   loadImageProps
             * @listens onsubmit: #editImage
             */
            const file_data = $('#imageUpload_file').prop('files')[0];
            const form_data_image = new FormData();
            form_data_image.append('file', file_data);
            event.preventDefault();
            form_data_image.append('event_kind', "submitChange");
            form_data_image.append('frame_id', $(".active_frame_lottie")[0].id);
            form_data_image.append('form_data', JSON.stringify(form_data));
            $.ajax({
                processData: false,
                contentType: false,
                method: 'POST',
                url: '/frame_change',
                data: form_data_image
            }).done(contentChangeHandler);
        } else {
            //submit others inputs
            $.ajax({
                method: 'POST',
                url: '/frame_change',
                data: {
                    'event_kind': event_kind,
                    'frame_id': frame_id,
                    'selected_kind': selected_kind,
                    'form_data': JSON.stringify(form_data),
                    'order': order
                }
            }).done(contentChangeHandler);
        }
    }
}

function contentChangeHandler(data) {
    const event_kind = data.event_kind;
    let frame_id = "frame_" + data.current_frame[0];
    let kind = data.kind;
    const frameText = data.frame_text;
    const spinner = $("#animSpinner");
    spinner.addClass("invisible");
    buildForm(data.anim_props, kind, data.color_palettes, frameText);
    changeActive(frame_id, ".frame_lottie");
    if (event_kind === "change_kind_click" || event_kind === "change_mini_lottie" || event_kind === "select_from_general") {
        $(".active_frame_lottie").attr("data-anim", data.current_frame[5]);
        document.querySelector(".active_frame_lottie lottie-player").load(data.anim_props.path);

    }

    changeNavItem(kind);
    buildAnim_byKind(data.animation_by_kind);
    breadCrumbs(data.project_props);
    // document.querySelector('#mainAnimation').load(data.anim_props.path);
    if (event_kind === "submitChange") {
        document.querySelector("#" + frame_id + " lottie-player").load(data.anim_props.path);
    }
    const pageSpinner = $("#pageSpinner");
    pageSpinner.addClass("invisible");
    // document.querySelector("#"+ frame_id+ " lottie-player").seek("20%");
}


function submitChange_function(event) {
    event.preventDefault();
    const event_kind = "submitChange";
    const form_data = new FormData(editForm[0]);
    form_data.append('event_kind', event_kind);
    $.ajax({
        processData: false,
        contentType: false,
        method: 'POST',
        url: '/frame_change',
        data: form_data
    }).done(contentChangeHandler);
}

function buildFrames(data) {
    let numSlides = [];

    for (let i = 0; i < data.frames[1].length; i++) {
        frameOrder = data.frames[1][i][5];
        let source = data.frames[0] + data.frames[1][i][1];
        let slide = `<div class="frame_container_class" data-order="${frameOrder}">
    <div id="frame_${data.frames[1][i][0]}" data-anim="${data.frames[1][i][2]}" class="tinyLottie frame_lottie animated_bounceIn bounceIn">
        <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
                       speed="1"
                       style="" hover loop>
        </lottie-player>
    </div>
    <p class="tinyLottieDescription">${frameOrder}</p>
</div>`;
        numSlides.push(slide);
    }
    const addBtn = `<div class="no-drag">
            <button id="newFrameBtn" class="primaryBTN">+</button>
        </div>`;
    // numSlides.push(addBtn);
    $('#newFrameBtn_area').html(addBtn);
    $('#frames_Area_container').html(numSlides);
    $('#newFrameBtn').on('click', frameChangeHandler);
    $('.frame_lottie').on('click', change_animation_handler);

    // creates the option to drag the frames around
    let framesArea = document.querySelector('#frames_Area_container');
    UIkit.sortable(framesArea, {
        clsNoDrag: "no-drag",
        animation: 200,
        clsCustom: ".dragged",
        clsPlaceholder: ".dragged",
        clsItem: ".dragged",
        clsDrag: ".dragged",
        clsDragState: ".dragged",
        clsBase: ".dragged"});
    UIkit.util.on(framesArea, 'moved', getDraggedInfo);
    UIkit.util.on(framesArea, 'start', getDraggedWidth);


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

function getDraggedWidth(eve) {
    let width_cont = $('#frames_Area_container').width();
    $('#frames_Area_container').width(width_cont);
}

function getDraggedInfo(eve){
    let currentMove = eve.detail[1].dataset.order;
    let indexes = [];
    let db_order = [];
    $(this).find('.frame_container_class').each(function() {
        indexes.push($(this).attr("data-order"));
    });
    $(this).find('.frame_container_class').each(function(i) {
        let frameId = this.firstElementChild.id.split("_")[1];
        $(this).attr("data-order", i + 1);
        indexes.push(i);
        $(this).find('p').text(`${i + 1}`);
        db_order.push([frameId, i])
    });
    $('#frames_Area_container').width("auto");
    $.ajax({
        method: 'POST',
        url: '/frame_order',
        data: {'db_order': JSON.stringify(db_order)}
    }).done();
}

function changeActive(id, name_of_class) {
    /**
     * changes the currently active lottie frame on the frames area & the same kind animations below the main
     * @param {string} id the id of the frame the user clicked on
     * @param {string} name_of_class the class of the lottie player to change to active state
     * @event onclick#
     */
    $(name_of_class).each(function (elm) {
        if (this.classList.contains("active_frame_lottie")) {
            this.classList.remove("active_frame_lottie")
            $(this).parent().children("p").removeClass("activeP");
            $(this).on('click', change_animation_handler);

        }
        // name_of_class = anim_lottie
        else if (this.classList.contains("active_anim_lottie")) {
            this.classList.remove("active_anim_lottie")
            $(this).parent().children("p").removeClass("activeP");
            $(this).on('click', change_animation_handler);
        } else if (this.classList.contains("active_from_general")) {
            this.classList.remove("active_from_general")
            $(this).parent().children("p").removeClass("activeP");
        }
    });

    if (name_of_class === ".frame_lottie") {
        $('#' + id).addClass("active_frame_lottie");
        $('#' + id).parent().children("p").addClass("activeP");
        $('#' + id).off('click', change_animation_handler);
    } else if (name_of_class === ".anim_kind") {
        let myid = $(".active_frame_lottie").attr('data-anim');
        $('#anim_' + myid).addClass("active_anim_lottie");
        $('#anim_' + myid).parent().children("p").addClass("activeP");
        $('#anim_' + myid).off('click', change_animation_handler);
    } else {
        //active_from_general
        $('#generalAnim_' + id).addClass("active_from_general");
        $('#generalAnim_' + id).parent().children("p").addClass("activeP");
    }
}

function create_color_pelettes_json(color_palettes) {
    var color_palettes_array = {};
    for (var i = 0; i < color_palettes.length; i++) {
        color_palettes_array[color_palettes[i][1]] = color_palettes[i][1];
    }
    $.extend(color_palettes_array, {'#000000': '#000000'});
    $.extend(color_palettes_array, {'#ffffff': '#ffffff'});

    return color_palettes_array
}


function buildForm(data, data_kind, color_palettes, frameText) {
    editForm.html("");
    animProps = data;
    /**
     * @param {JSON}    data    the data recieved by the server holding the animation properties
     * Description. checking the parameters of the animation and building the form accordingly
     */

    let colorUi = [];
    let colorId = [];
    let path = "";
    let color_palettes_json = create_color_pelettes_json(color_palettes);
    if (data != null) {
        // const content = $('#content');
        Object.keys(data).forEach(function (elem) {
            if (elem === "empty") {
                editForm.html("")
            } else {
                if (elem === "path") {
                    path = data[elem]
                } else if (elem.includes("primary")) {
                    colorUi.push(getColor(elem, data[elem]));
                    colorId.push(elem)
                } else if (elem.includes("secondary") || elem.includes("base")) {
                    colorUi.push(getColor(elem, data[elem]));
                    colorId.push(elem)
                } else if (elem === 'image') {
                    editForm.append(getImage());
                } else if (elem.includes('listItem')) {
                    let a = getText(elem, data[elem].text, "listItem");

                    editForm.append(a);
                    $('#listItemalignment option[value=' + data[elem].text.alignment + ']').prop('selected', true);
                    addCustomColor('#listItem_color', color_palettes_json);
                    editForm.append(`<div>
                                                <button class="primaryBTN" id="addBulletBtn" role="button" type="button">+</button>
                                                <button type="button" role="button" id="removeBulletBtn" class="primaryBTN">-</button>
                                            </div>`);

                    let numBullets = $("input[name*='listItemcontent']").length;
                    $('#addBulletBtn').on('click', function (event) {
                        const bulletTextBox = `<input type="text" maxlength="24" name=${'listItemcontent' + (numBullets + 1)} id=${'listItemcontent_' + (numBullets + 1)} value="הטקסט שלך" class="form-control">`;
                        $('#editText_listItem').append(bulletTextBox);
                        numBullets++;
                        checkNumBullets();
                        $('#submitChange').removeClass("secondaryBtn_disabled");
                    });
                    $('#removeBulletBtn').on('click', function (event) {
                        $('#editText_listItem input[type="text"]').last().remove();
                        numBullets--;
                        $('#submitChange').removeClass("secondaryBtn_disabled");
                        checkNumBullets();
                    });


                    let colorListUi = [];
                    let colorListId = [];
                    Object.keys(data[elem]).forEach(function (item) {
                        if (item === "primary") {
                            colorListUi.push(getColor('listItem_' + item, data[elem][item]));
                            colorListId.push('listItem_' + item)
                        } else if (item === "secondary") {
                            colorListUi.push(getColor('listItem_' + item, data[elem][item]));
                            colorListId.push('listItem_' + item)
                        }
                    });

                    if (colorListUi.length > 0) {
                        /**
                         *checks how many shape layers there are in the animation and building the color-picker UI
                         */
                        createColorUi(colorListUi, colorListId, color_palettes_json)
                    }

                    /**
                     * checks if there are more than 3 bullets
                     * cannot be initiated from outside buildForm func
                     * called on build form initial load and after adding new bullet
                     */
                    function checkNumBullets() {


                        const removeBullet = $('#removeBulletBtn');
                        const addBulletBtn = $("#addBulletBtn");
                        if (numBullets >= 3) {
                            addBulletBtn.prop("disabled", true);
                            addBulletBtn.addClass('disabled');
                        } else if (numBullets <= 1) {
                            removeBullet.prop("disabled", true);
                            removeBullet.addClass('disabled');
                        } else {
                            addBulletBtn.prop("disabled", false);
                            addBulletBtn.removeClass('disabled');
                            removeBullet.prop("disabled", false);
                            removeBullet.removeClass('disabled');
                        }
                    }

                    checkNumBullets();
                } else if (elem === "text") {
                    editForm.prepend(getText(elem, data[elem], data_kind));
                    addCustomColor('#text_color', color_palettes_json);

                    $('#textfont_size option[value=' + data[elem].font_size + ']').prop('selected', true)
                    $('#textalignment option[value=' + data[elem].alignment + ']').prop('selected', true)
                }
            }
        });
        const main_animation = document.querySelector('#mainAnimation');
        main_animation.load(path);
    }

    if (colorUi.length > 0) {
        /**
         *checks how many shape layers there are in the animation and building the color-picker UI
         */
        createColorUi(colorUi, colorId, color_palettes_json)
    }

    //disabled


    const displayText = getFrameText(frameText);

    editForm.append(displayText);
    //
    // $('textarea').change(function () {
    //     $('#submitChange').removeClass("secondaryBtn_disabled");
    // });
    // $('textarea').keyup(function () {
    //     $('#submitChange').removeClass("secondaryBtn_disabled");
    // });
    editForm.append(`<input type="submit" name="submitChange" id="submitChange"  class="secondaryBtn_disabled btn secondaryBtn justify-content-center" value="שמירה" />`);
    $('#content input, #frameText, select').on('keyup change', function () {
        $('#submitChange').removeClass("secondaryBtn_disabled");
    });
    $('#dltFrameBtn').on('click', frameChangeHandler);
    $('#submitChange').on('click', change_animation_handler);

}


function getFrameText(text) {
    if (text == null) {
        text = ""
    }
    return `<div class="form-group frame-text-wrapper mr-3"> 
  <h3>הערות לצילום: </h3>
<textarea id="frameText" name="side_note" class="form-control" placeholder="ניתן להקליד פה הערות למצולם אשר יופיעו מולו בזמן הצילום">${text}</textarea></div>`
}

function getImage() {
    return `<div id="editImage" enctype="multipart/form-data">
                <h3>העלאת תמונה</h3>
                <div class="imageUpload_file_div">
                   <input type="file" id="imageUpload_file" name="imageUpload_file" style="display:none;"  onchange="loadFile(event)" value="+">
                  <input type="button" id="imageUpload_file_btn" value="החלפת תמונה" class="btn secondaryBtn justify-content-center"  onclick="document.getElementById('imageUpload_file').click();" />
                  <h6 id="p_preview_imageUpload" style="display:none;">תצוגה מקדימה לתמונה:</h6>
                  <img id="preview_imageUpload" src="#" class="mainAnimation" style="display:none;" alt="your upload image" />
                </di>
            </div>`
}

function loadFile(event) {
    var reader = new FileReader();
    reader.onload = function () {
        document.getElementById('p_preview_imageUpload').style.display = "block";
        var output = document.getElementById('preview_imageUpload');
        output.style.display = "block";
        output.src = reader.result;

    };
    reader.readAsDataURL(event.target.files[0]);
}


function getColor(name, color) {
    /**
     * @param {string}  name    name of the animation attribute to use for HTML names
     * @param {list}    color   the color of the layer
     * @return {HTMLElement}
     */
    if (color.color == null) {
        color = color;
    } else {
        color = color.color;
    }

    return `<div id=${name} class=" color-wrapper">
                  <input type="hidden"  name=${name} class="form-control" value=${color} />
                  <div id="name_${name}" class="name-of-color"></div>
                  <span class="color-edit-line" data-toggle="tooltip" data-placement="right" title="${name}">
                        <span class="colorpicker-input-addon"><i class="colorUi"></i></span>
                    </span>
            </div>`
}


function getText(name, text, data_kind) {
    /**
     * @param {string}  name    name of the animation attribute to use for HTML names
     * @param {list}    color   the color of the layer
     * @return {HTMLElement}
     */
    let my_color;
    let h3_name = "";
    let inputText = "";
    let fontSize = 0;
    my_color = getColor(name + '_color', text.color);
    if (data_kind === "listItem") {
        h3_name = "סעיפי הרשימה";
        text.content.forEach(function (content, index) {
            inputText += `<input type="text" lang="he" maxlength="24" name=${name + 'content' + (index + 1)} id=${name + 'content_' + (index + 1)} value="${content}" class="form-control">`
            
        });
        fontSize = [38, 58, 72]
    } else {
        my_color = getColor(name + '_color', text.color);
        if (data_kind === "intro") {
            h3_name = "תוכן פתיח";
            fontSize = [72, 92, 112]
        } else if (data_kind === "ending") {
            h3_name = "תוכן סיום";
            fontSize = [72, 92, 112]
        } else if (data_kind === "text") {
            h3_name = "תוכן ";
            fontSize = [38, 58, 72]
        } else if (data_kind === "list") {
            h3_name = "כותרת הרשימה";
            fontSize = [38, 58, 72]
        }

        inputText = `<input type="text" maxlength="24" name=${name + 'content'} id=${name + 'content'} name="animText" value="${text.content}" class="form-control">`;
    }


    return `<div id="editText_${name}" class="form-group text-form">
                <h3>${h3_name}</h3>
                    <div class="input-group text-edit-line-control">
                    <span class="text-edit-line-after">
                            <select name=${name + 'font'} id=${name + 'font'} class="custom-select text-edit-line" value="Arial" >
                                <option value="0">Arial</option>
                            </select>    
                    </span>
                    <span class="text-edit-line-after">
                           <select name=${name + 'font_size'} id=${name + 'font_size'} class="custom-select text-edit-line">
                                <option selected="selected" value=${fontSize[0]}>גודל קטן</option>
                                 <option value=${fontSize[1]}>גודל גדול</option>
                                 <option value=${fontSize[2]}>גודל גדול מאוד</option>
                            </select>
                    </span>
                    <span class="text-edit-line-after">
                           <select name=${name + 'alignment'} id=${name + 'alignment'} class="custom-select text-edit-line" value=${text.alignment} >
                                <option selected="selected" value="0">יישור לשמאל</option>
                                <option value="1">יישור לימין</option>
                                <option value="2">יישור למרכז</option>
                            </select>
                    </span>
                             ${my_color}
                    </div>
                    ${inputText}
            </div>`;
}

function createColorUi(colors, colorId, color_palettes_json) {
    /**
     * todo: this function needs to get the name of the color input ( ראשי - משני )
     * @type {string}
     */


    let colorForm = `<div id="editColor" class="form-group">
                                <h3>צבעי רקע</h3>
                            <div id="inputWrapper_${colorId[0]}" class="text-edit-line-control color-edit-line-control">
                        </div>
                            
                        </div>`;
    editForm.append(colorForm);
    const inputWrapper = $('#inputWrapper_' + colorId[0]);

    for (let i = 0; i < colors.length; i++) {
        inputWrapper.append(colors[i]);
        let myName = "";
        if (colorId[i].includes("primary")) {
            myName = "ראשי";
        } else if (colorId[i].includes("secondary")) {
            myName = "משני";
        } else if (colorId[i].includes("third")) {
            myName = "רקע";
        }
        $('#name_' + colorId[i]).html(myName);
        addCustomColor('#' + colorId[i], color_palettes_json);
    }
}


function changeNavItem(kind) {

    /* change the color of the selceted nav item */
    var indexActive = 1;
    $('.sidebar a').each(
        function () {
            if ($(this).attr('id') == "temp_" + kind) {
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

    if (kind == "empty") {
        $('#button_switch').addClass("secondaryBtn_disabled");
        $('#button_switch').on('click', disabledFunc);
        $("#button_switch").off('click', open_modal_handler);
    } else {
        $('#button_switch').removeClass("secondaryBtn_disabled");
        $('#button_switch').on('click', open_modal_handler);
        $("#button_switch").off('click', disabledFunc);
    }
}


function buildAnim_byKind(data) {
    /**
     * I think this function is written twice
     * @Ruby check if we can delete 1 function
     * todo indicate which type is now playing
     * update main animation with all props applied
     * @type {*[]}
     */

    let animations = [];
    let source;
    let collection_svg = ""

    if (data != null) {
        for (let i = 0; i < data.length; i++) {
            source = data[i][1];
            if (data[i].length >= 4) {
                collection_svg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.1 11.7H9.9V13.5H8.1V11.7ZM8.1 4.5H9.9V9.9H8.1V4.5ZM8.991 0C4.023 0 0 4.032 0 9C0 13.968 4.023 18 8.991 18C13.968 18 18 13.968 18 9C18 4.032 13.968 0 8.991 0ZM9 16.2C5.022 16.2 1.8 12.978 1.8 9C1.8 5.022 5.022 1.8 9 1.8C12.978 1.8 16.2 5.022 16.2 9C16.2 12.978 12.978 16.2 9 16.2Z"/>
                </svg>`;

            }
            let animKindPlayer = `<div class="tinyLottie_continer">
                <span class="not_in_collection_svg_icon" data-toggle="tooltip" data-placement="right" title="אנימציה לא מהמותג">${collection_svg}</span>
                <div id="anim_${data[i][2]}" class="tinyLottie anim_kind">
                <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
                               speed="1"
                               style="" hover loop>
                </lottie-player>
                </div>
                <p class="tinyLottieDescription">${data[i][0]}</p>
                </div>`;
            animations.push(animKindPlayer);
        }
    }
    $("#kindAnimationsArea").html(animations);
    $('.anim_kind').on('click', change_animation_handler);
    changeActive(null, ".anim_kind");
    $('[data-toggle="tooltip"]').tooltip();
}

function open_modal_handler(event) {
    let event_kind = ""
    $('#button_switch').removeClass('secondaryBtn_disabled');
    $("#button_switch").off('click', disabledFunc);

    $('#modal').modal('show')
    if (event.currentTarget.id == "button_switch") {
        event_kind = "button_switch"
        let frame_id = $(".active_frame_lottie")[0].id;

        $.ajax({
            method: 'POST',
            url: '/get_all_animation_by_kind',
            data: {'event_kind': event_kind, 'frame_id': frame_id}
        }).done(modael_data);
    }
}


function modael_data(data) {
    let animations = [];
    let source;

    if (data.event_kind == "button_switch") {
        //reset and set modal_main_btn listeners and class soshake animation will play from disabledFunc
        $("#modal_main_btn").on('click', disabledFunc);
        $("#modal_main_btn").off('click', change_animation_handler);
        $("#modal_main_btn").removeClass("animated_shake jello");
        $("#modal_main_btn").addClass("disabled");

        for (let i = 0; i < data.frames.length; i++) {
            source = data.path + data.frames[i][1];
            let collection_svg = ""
            if (data.frames[i][3] == true) {
                collection_svg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 9.5H1C0.726142 9.5 0.5 9.27386 0.5 9V1C0.5 0.726142 0.726142 0.5 1 0.5H7C7.27386 0.5 7.5 0.726142 7.5 1V9C7.5 9.27386 7.27386 9.5 7 9.5ZM7 17.5H1C0.726142 17.5 0.5 17.2739 0.5 17V13C0.5 12.7261 0.726142 12.5 1 12.5H7C7.27386 12.5 7.5 12.7261 7.5 13V17C7.5 17.2739 7.27386 17.5 7 17.5ZM17 17.5H11C10.7261 17.5 10.5 17.2739 10.5 17V9C10.5 8.72614 10.7261 8.5 11 8.5H17C17.2739 8.5 17.5 8.72614 17.5 9V17C17.5 17.2739 17.2739 17.5 17 17.5ZM10.5 5V1C10.5 0.726142 10.7261 0.5 11 0.5H17C17.2739 0.5 17.5 0.726142 17.5 1V5C17.5 5.27386 17.2739 5.5 17 5.5H11C10.7261 5.5 10.5 5.27386 10.5 5Z"  stroke-linecap="round"/>
                </svg>`;
            }
            let animKindPlayer = `<div class="tinyLottie_continer">
            <div id="generalAnim_${data.frames[i][2]}" class="tinyLottie anim_kind general_kind_anim">
            <span class="collection_svg_icon">${collection_svg}</span>
                <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
                               speed="1"
                               style="" hover loop>
                </lottie-player>
            </div>
            <p class="tinyLottieDescription">${data.frames[i][0]}</p> 
            </div>`;
            animations.push(animKindPlayer);
        }
        let name_of_kind = $('#temp_' + data.kind).text();
        $('.modal-title').text("בחירה מתבניות כלליות-" + name_of_kind);
        $('.modal-body').html(animations);

        $('.general_kind_anim').on("click", select_from_general)
    }
}


function disabledFunc(event) {
    if (event.currentTarget.classList.contains("disabled") || event.currentTarget.classList.contains("secondaryBtn_disabled")) {
        if (event.currentTarget.id == "button_switch" && event.currentTarget.classList.contains("secondaryBtn_disabled")) {
            $("#button_switch").off('click', open_modal_handler);
        }

        event.preventDefault();
        $("#" + event.currentTarget.id).addClass("animated_shake jello");
        setTimeout(function () {
            $("#" + event.currentTarget.id).removeClass("animated_shake jello");
        }, 3000);
    }
}

function select_from_general(event) {
    let id = (event.currentTarget.id).substr(12);
    changeActive(id, ".general_kind_anim");

    //reset and set modal_main_btn listeners and class so shake animation will not play and animation will change
    $("#modal_main_btn").removeClass("animated_shake jello");
    $("#modal_main_btn").removeClass("disabled");
    $("#modal_main_btn").off('click', disabledFunc);
    $('#modal_main_btn').on('click', change_animation_handler);
}


function addCustomColor(id, palette) {
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
        },
        extensions: [
            {
                name: 'swatches', // extension name to load
                options: { // extension options
                    colors: palette
                },

            }
        ]
    });
}


function breadCrumbs(data) {
    let video_name = data[1]
    let project_name = data[0][0][1]
    let project_name_div= ""
    if (project_name.length >= 17) {
        project_name_div = project_name.slice(0, 16) + "..";
    } else {
        project_name_div = project_name;
    }

    let div = `<nav id="page_breadcrumb" class="mr-auto pt-1 pb-3 " aria-label="breadcrumb">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="homePage">
                             <svg id="home_icon" width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 10H7V10.5V14.5H4.25V9V8.5H3.75H2.80298L9 2.92268L15.197 8.5H14.25H13.75V9V14.5H11V10.5V10H10.5H7.5Z" fill="#BDBDBD" stroke="#BDBDBD"/>
                             </svg>
                                דף הבית
                        </a></li>
                        <li class="breadcrumb-item"><a id="project_${data[0][0][0]}" href="projectPage" data-toggle="tooltip" data-placement="bottom"
                                    title="${project_name}">
                            <svg id="project_icon" width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.5 3H3C2.175 3 1.5075 3.675 1.5075 4.5L1.5 13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V6C16.5 5.175 15.825 4.5 15 4.5H9L7.5 3Z" fill="#BDBDBD"/>
                            </svg>
                        ${project_name_div}</a></li>
                        <li class="breadcrumb-item" aria-current="page">  
                        <a id="current_page_breadcrumb_a" href="#">
                        <svg width="12" height="12" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0)">
                            <rect x="2.0376" y="2.5" width="19" height="19" rx="4" fill="#2F1359"/>
                            <path d="M15.2779 12.0659L9.78567 8.92747C9.45234 8.73699 9.0376 8.97768 9.0376 9.36159V15.6384C9.0376 16.0223 9.45234 16.263 9.78567 16.0725L15.2779 12.9341C15.6138 12.7422 15.6138 12.2578 15.2779 12.0659Z" fill="#FCFCFC" stroke="#F9FAFB"/>
                            </g>
                            <defs>
                            <clipPath id="clip0">
                            <rect width="23" height="23" fill="white" transform="translate(0.0375977 0.5)"/>
                            </clipPath>
                            </defs>
                        </svg>

                        <div id="current_page_breadcrumb" class="align-middle">${video_name}</div></a>                          
                         </li>
                      </ol>
                 </nav> `;
    $('#pageTitleH').html(div);
    $('[data-toggle="tooltip"]').tooltip();

    let user_div = `<img src="${data[2][1]}" class="img-thumbnail rounded-circle" style="width: 2.2vw;height:2.2vw;" alt="">
        <p>${data[2][0]}</p>

<!--<svg width="10" height="6" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--<path d="M8.81084 0.815816C8.71522 0.728061 8.56836 0.728061 8.47275 0.815816L5 4.00313L1.52725 0.815816C1.43164 0.728061 1.28478 0.728061 1.18916 0.815816L0.830955 1.14458C0.779366 1.19193 0.75 1.25874 0.75 1.32877C0.75 1.39879 0.779366 1.4656 0.830955 1.51295L4.83095 5.18418C4.92657 5.27194 5.07343 5.27194 5.16905 5.18418L9.16905 1.51295C9.22063 1.4656 9.25 1.39879 9.25 1.32877C9.25 1.25874 9.22063 1.19193 9.16905 1.14458L8.81084 0.815816Z" fill="#BDBDBD" stroke="#BDBDBD" stroke-width="0.5" stroke-linejoin="round"/>-->
<!--</svg>-->
`;
    $('#user_area_sidenav').html(user_div);
}
