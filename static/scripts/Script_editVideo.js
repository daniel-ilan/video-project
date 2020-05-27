let editForm = "";
let animProps = "";
let boolX = false;

$(document).ready(function () {
    // const editForm = $('#content');
    editForm = $('#content');
    if (editForm.val() === "" && boolX == false) {
        frameChangeHandler();
        boolX = true;
    }
    $(".sidebarCol li a").on('click', change_animation_handler);

});


$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})



function frameChangeHandler(event) {
    let event_kind = ""
    let frame_id = ""
    if (event == null) {
        event_kind = "onLoad"
    } else if (event.currentTarget.id == "dltFrameBtn") {
        event_kind = "delete_frame"
        frame_id = $(".active_frame_lottie")[0].id;
        event.preventDefault();
    } else if (event.currentTarget.id == "newFrameBtn") {
        event_kind = "new_frame"
    }

    $.ajax({
        method: 'POST',
        url: '/frame_change',
        data: {'event_kind': event_kind, 'frame_id': frame_id}
    }).done(buildFrames, contentChangeHandler);
}



function change_animation_handler(event) {
    let event_kind = ""
    let frame_id = ""
    let selected_kind = ""
    let form_data = ""

    if(event.currentTarget.classList.contains("secondaryBtn_disabled"))
    {
        disabledFunc(event)
    }
    else
    {
        if (event.currentTarget.classList.contains("frame_lottie")) {
            event_kind = "frame_click"
            frame_id = event.currentTarget.id;
        } else if (event.currentTarget.classList.contains("nav-link")) {
            event_kind = "change_kind_click"
            frame_id = $(".active_frame_lottie")[0].id;
            selected_kind = (event.currentTarget.id).slice(5);
            console.log("xxx")

        } else if (event.currentTarget.id == "submitChange") {
            event_kind = "submitChange";
            event.preventDefault();
            frame_id = $(".active_frame_lottie")[0].id;
            form_data = []
            $('#content input').each(function () {
                form_data.push([$(this).attr('name'), $(this).val()])
            });
            $('#content select').each(function () {
                form_data.push([$(this).attr('name'), $(this).val()])
            });
        }
        else if (event.currentTarget.classList.contains("anim_kind")) {
            // change between two animation from the same kind and brand
            event_kind = "change_mini_lottie"
            frame_id =$(".active_frame_lottie")[0].id;
            // selected_kind in this function represent the selected mini anim for replace to
            selected_kind = event.currentTarget.id;
            //selected_kind = event.target.src;
        }
        else if (event.currentTarget.id == "modal_main_btn") {
            event_kind = "select_from_general";
            frame_id = $(".active_frame_lottie")[0].id;
            // selected_kind in this function represent the selected mini anim for replace to
            selected_kind = $('.active_from_general')[0].id;
            $('#modal').modal('hide')
        }


        // check if their is image upload input
        var is_imageUpload_file = false;
        for(var i=0; i<form_data.length;i++)
        {
            if(form_data[i].includes("imageUpload_file"))
            {
                is_imageUpload_file= true;
            }
        }

        if(is_imageUpload_file)
        {
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
            $.ajax({
                processData: false,
                contentType: false,
                method: 'POST',
                url: '/frame_change',
                data: form_data_image
            }).done(contentChangeHandler);
        }
        else
        {
            //submit others inputs
            $.ajax({
                method: 'POST',
                url: '/frame_change',
                data: {'event_kind': event_kind, 'frame_id': frame_id, 'selected_kind': selected_kind, 'form_data': JSON.stringify(form_data)}
            }).done(contentChangeHandler);
        }
    }
}

function contentChangeHandler(data) {
    const event_kind = data.event_kind
    let frame_id = "frame_" + data.current_frame[0];
    let kind = data.kind

    buildForm(data.anim_props, kind, data.color_palettes)
    changeActive(frame_id, ".frame_lottie");
    if (event_kind == "change_kind_click" || event_kind=="change_mini_lottie" || event_kind=="select_from_general" ) {
        $(".active_frame_lottie").attr("data-anim", data.current_frame[5]);
    }

    changeNavItem(kind);
    buildAnim_byKind(data.animation_by_kind);
    // document.querySelector('#mainAnimation').load(data.anim_props.path);
    if (event_kind == "submitChange") {
        document.querySelector("#"+ frame_id+ " lottie-player").load(data.anim_props.path);
    }
    // document.querySelector("#"+ frame_id+ " lottie-player").seek("20%");
}



function submitChange_function(event) {
    event.preventDefault();
    event_kind = "submitChange"
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
    for (i = 0; i < data.frames[1].length; i++) {
        let source = data.frames[0] + data.frames[1][i][1];
        let slide = `<div class="frame_container_class">
    <div id="frame_${data.frames[1][i][0]}" data-anim="${data.frames[1][i][2]}" class="tinyLottie frame_lottie animated_bounceIn bounceIn">
        <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
                       speed="1"
                       style="" hover loop>
        </lottie-player>
    </div>
    <p class="tinyLottieDescription">${i + 1}</p>
</div>`;
        numSlides.push(slide);
    }
    const addBtn = `<div>
            <button id="newFrameBtn" class="primaryBTN">+</button>
        </div>`;
    numSlides.push(addBtn);
    $('#frames_Area').html(numSlides);
    $('#newFrameBtn').on('click', frameChangeHandler);
    $('.frame_lottie').on('click', change_animation_handler);
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
        }
        else if(this.classList.contains("active_from_general")) {
            this.classList.remove("active_from_general")
            $(this).parent().children("p").removeClass("activeP");
        }
    });

    if (name_of_class === ".frame_lottie") {
        $('#' + id).addClass("active_frame_lottie");
        $('#' + id).parent().children("p").addClass("activeP");
        $('#' + id).off('click', change_animation_handler);
    }
    else if(name_of_class === ".anim_kind") {
        let myid = $(".active_frame_lottie").attr('data-anim');
        $('#anim_' + myid).addClass("active_anim_lottie");
        $('#anim_' + myid).parent().children("p").addClass("activeP");
        $('#anim_' + myid).off('click', change_animation_handler);
    }
    else
    {
        //active_from_general
        $('#generalAnim_' + id).addClass("active_from_general");
        $('#generalAnim_' + id).parent().children("p").addClass("activeP");
    }
}

function create_color_pelettes_json(color_palettes) {
    var color_palettes_array = {};
    for (var i = 0 ; i < color_palettes.length; i++) {
        color_palettes_array[color_palettes[i][1]] = color_palettes[i][1];
    }
    $.extend(color_palettes_array, {'#000000': '#000000'});
    $.extend(color_palettes_array, {'#ffffff': '#ffffff'});

    return color_palettes_array
}


function buildForm(data, data_kind,color_palettes) {
    editForm.html("");
    animProps = data;
    /**
     * @param {JSON}    data    the data recieved by the server holding the animation properties
     * Description. checking the parameters of the animation and building the form accordingly
     */

    let colorUi = [];
    let colorId = [];
    color_palettes_json = create_color_pelettes_json(color_palettes);

    if (data != null) {
        // const content = $('#content');
        Object.keys(data).forEach(function (elem) {
            if (elem === "empty") {
                editForm.html("")
            } else {
                if (elem === "path") {
                    path = data[elem]
                } else if (elem === "primary") {
                    colorUi.push(getColor(elem, data[elem]))
                    colorId.push(elem)
                } else if (elem === "secondary") {
                    colorUi.push(getColor(elem, data[elem]))
                    colorId.push(elem)
                } else if (elem === "text") {
                    editForm.append(getText(elem, data[elem],data_kind));
                    addCustomColor('#text_color')

                    $('#textalignment option[value=' + data[elem].alignment + ']').prop('selected', true)
                } else if (elem === 'image') {
                    editForm.append(getImage());
                } else if (elem === 'listItem') {
                    editForm.append(getText(elem, data[elem].text,"listItem"));
                    addCustomColor('#listItem_color')

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
                        createColorUi(colorListUi, colorListId,color_palettes_json)
                    }
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
        createColorUi(colorUi, colorId,color_palettes_json)
    }
    //disabled
    editForm.append(`<input type="submit" name="submitChange" id="submitChange"  class="secondaryBtn_disabled btn secondaryBtn justify-content-center" value="שמירה" />`);
    $('#dltFrameBtn').on('click', frameChangeHandler);
    $('#submitChange').on('click', change_animation_handler);

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
    reader.onload = function(){
        document.getElementById('p_preview_imageUpload').style.display= "block";
        var output = document.getElementById('preview_imageUpload');
        output.style.display= "block";
        output.src = reader.result;

    };
    reader.readAsDataURL(event.target.files[0]);
};



function getColor(name, color) {
    /**
     * @param {string}  name    name of the animation attribute to use for HTML names
     * @param {list}    color   the color of the layer
     * @return {HTMLElement}
     */
    if(color.color == null)
    {
        color = color;
    }
    else
    {
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
    let h3_name = "";
    if(data_kind == "intro")
    {
        h3_name = "תוכן פתיח";
    }
    else if(data_kind == "ending")
    {
        h3_name = "תוכן סיום";

    }
    else if(data_kind == "text")
    {
        h3_name = "תוכן ";

    }
    else if(data_kind == "list")
    {
        h3_name = "סעיפי הרשימה";
    }
    else if(data_kind == "listItem")
    {
        h3_name = "כותרת הרשימה";
    }
     let my_color = getColor(name+'_color',text.color)

    return `<div id="editText" class="form-group text-form">
                <h3>${h3_name}</h3>
                    <div class="input-group text-edit-line-control">
                    <span class="text-edit-line-after">
                            <select name=${name + 'font'} id=${name + 'font'} class="custom-select text-edit-line" value="Arial" >
                                <option value="0">Arial</option>
                            </select>    
                    </span>
                    <span class="text-edit-line-after">
                           <select name=${name + 'font_size'} id=${name + 'font'} class="custom-select text-edit-line" value="גודל בינוני" >
                                <option value="0">גודל קטן</option>
                                 <option value="1">גודל בינוני</option>
                                 <option value="2">גודל גדול</option>
                                 <option value="3">גודל גדול מאוד</option>
                            </select>
                    </span>
                    <span class="text-edit-line-after">
                           <select name=${name + 'alignment'} id=${name + 'alignment'} class="custom-select text-edit-line" value=${text.alignment} >
                                <option value="0">יישור לשמאל</option>
                                <option value="1">יישור לימין</option>
                                <option value="2">יישור למרכז</option>
                            </select>
                    </span>
                             ${my_color}
                    </div>
                    <input type="text" maxlength="24" name=${name + 'content'} id=${name + 'content'} name="animText" value="${text.content}" class="form-control">
            </div>`;
}

function createColorUi(colors, colorId,color_palettes_json) {
    let colorForm = `<div id="editColor" class="form-group">
                                <h3>צבעי רקע</h3>
                            <div id="inputWrapper_${colorId[0]}" class="text-edit-line-control color-edit-line-control">
                        </div>
                            
                        </div>`;
    editForm.append(colorForm);
    const inputWrapper = $('#inputWrapper_' + colorId[0]);

    for (i = 0; i < colors.length; i++) {
        inputWrapper.append(colors[i]);
        let myName = "";
         if(colorId[i] == "primary")
        {
            myName = "צבע ראשי";
        }
        else if(colorId[i] =="secondary")
        {
            myName = "צבע רקע";
        }
        $('#name_' +colorId[i]).html(myName);
        addCustomColor('#' + colorId[i]);
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

    if(kind== "empty")
    {
        $('#button_switch').addClass("secondaryBtn_disabled");
        $('#button_switch').on('click',  disabledFunc);
        $( "#button_switch" ).off('click', open_modal_handler);


    }
    else
    {
        $('#button_switch').removeClass("secondaryBtn_disabled");
        $('#button_switch').on('click', open_modal_handler);
        $( "#button_switch" ).off('click', disabledFunc);
    }
}

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

function buildAnim_byKind(data) {
    /**
     * todo indicate which type is now playing
     * update main animation with all props applied
     * @type {*[]}
     */

    let animations = [];
    let source;
    let collection_svg=""

    if (data != null) {
        for (i = 0; i < data.length; i++) {
            source = data[i][1];
            if (data[i].length >=4)
            {
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
}

function open_modal_handler(event) {
    let event_kind = ""
    $('#button_switch').removeClass('secondaryBtn_disabled');
    $( "#button_switch" ).off('click', disabledFunc);

    $('#modal').modal('show')
     if (event.currentTarget.id == "button_switch") {
         event_kind = "button_switch"
        frame_id = $(".active_frame_lottie")[0].id;

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

    if (data.event_kind == "button_switch")
    {
        //reset and set modal_main_btn listeners and class soshake animation will play from disabledFunc
        $( "#modal_main_btn" ).on('click', disabledFunc);
        $( "#modal_main_btn" ).off('click', change_animation_handler);
        $("#modal_main_btn").removeClass("animated_shake jello");
        $("#modal_main_btn").addClass("disabled");

        for (i = 0; i < data.frames.length; i++) {
            source = data.path + data.frames[i][1];
            let collection_svg= ""
            if (data.frames[i][3]== true)
            {
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
            name_of_kind= $('#temp_'+ data.kind).text();
        $('.modal-title').text( "בחירה מתבניות כלליות-"+ name_of_kind);
        $('.modal-body').html(animations);
        
        $('.general_kind_anim').on("click", select_from_general)
    }
}


function disabledFunc(event)
{
    if(event.currentTarget.classList.contains("disabled") || event.currentTarget.classList.contains("secondaryBtn_disabled"))
    {
        if(event.currentTarget.id=="button_switch" && event.currentTarget.classList.contains("secondaryBtn_disabled"))
        {
            $( "#button_switch" ).off('click', open_modal_handler);
        }

        event.preventDefault();
        $("#"+event.currentTarget.id).addClass("animated_shake jello");
        setTimeout(function() {
            $("#"+event.currentTarget.id).removeClass("animated_shake jello");
        }, 3000);
    }

}

function select_from_general(event) {
    let id = (event.currentTarget.id).substr(12);
    changeActive(id, ".general_kind_anim");

    //reset and set modal_main_btn listeners and class so shake animation will not play and animation will change
    $("#modal_main_btn").removeClass("animated_shake jello");
    $("#modal_main_btn").removeClass("disabled");
    $( "#modal_main_btn" ).off('click', disabledFunc);
    $('#modal_main_btn').on('click', change_animation_handler);
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
        },
        extensions: [
            {
                name: 'swatches', // extension name to load
                options: { // extension options
                    colors: color_palettes_json
                },

            }
        ]
    });
}