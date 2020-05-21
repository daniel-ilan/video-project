let editForm = "";
let deleteFrameBtn = "";
let animProps = "";


$(document).ready(function () {
    // const editForm = $('#content');
    editForm = $('#content');
    if (editForm.val() === "") {
        loadForm();
    }


    deleteFrameBtn = $('#dltFrameBtn');
    deleteFrameBtn.on('click', deleteFrameFunc)


});

/***    Runs when loading the initial page  ***/
function loadForm() {
    /**
     * Ajax call to load the page from first login
     */
    $.ajax({
        method: 'POST',
        url: '/editContent',
        data: $(this).serialize()
    }).done(buildForm, buildFrames,changeFrame);
}



function buildFrames(data) {
    let numSlides = [];
    for (i = 0; i < data.frames[1].length; i++) {
        let source = data.frames[0] + data.frames[1][i][1];
        let slide = `<div id="frame_${data.frames[1][i][0]}" data-anim="${data.frames[1][i][2]}" class="tinyLottie frame_lottie">
        <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
    speed="1"
    style="" hover loop>
    </lottie-player>
    <p class="tinyLottieDescription">${i + 1}</p>
    </div>
    
    <div>
    _
    </div>`;
        numSlides.push(slide);
    }

    const addBtn = `<div>
            <button id="newFrameBtn" class="primaryBTN">+</button>
        </div>`;
    numSlides.push(addBtn);


    $('#frames_Area').html(numSlides);
    $('#newFrameBtn').on('click', addFrame);
    $('.frame_lottie').on('click', {name: "user_change"}, changeFrame);

}



function buildForm(data) {
    editForm.html("");
    animProps = data;

    /**
     * @param {JSON}    data    the data recieved by the server holding the animation properties
     * Description. checking the parameters of the animation and building the form accordingly
     */


    let colorUi = [];
    let colorId = [];

    if (data != null) {
        // const content = $('#content');
        Object.keys(data.result).forEach(function (elem) {

            if (elem === "empty") {
                editForm.html("")
            } else {
                if (elem === "path") {
                    buildMain(data.result[elem])
                } else if (elem === "primary") {
                    colorUi.push(getColor(elem, data.result[elem]))
                    colorId.push(elem)
                } else if (elem === "secondary") {
                    colorUi.push(getColor(elem, data.result[elem]))
                    colorId.push(elem)
                } else if (elem === "text") {
                    editForm.append(getText(elem, data.result[elem]));
                    $('#textalignment option[value=' + data.result[elem].alignment + ']').prop('selected', true)
                } else if (elem === 'image') {
                    editForm.append(getImage(elem), data.result[elem]);
                } else if (elem === 'listItem') {
                    editForm.append(getText(elem, data.result[elem].text));
                    let colorListUi = [];
                    let colorListId = [];

                    Object.keys(data.result[elem]).forEach(function (item) {
                        if (item === "primary") {
                            colorListUi.push(getColor('listItem_' + item, data.result[elem][item]));
                            colorListId.push('listItem_' + item)
                        } else if (item === "secondary") {
                            colorListUi.push(getColor('listItem_' + item, data.result[elem][item]));
                            colorListId.push('listItem_' + item)
                        }
                    });

                    if (colorListUi.length > 0) {
                        /**
                         *checks how many shape layers there are in the animation and building the color-picker UI
                         */
                        createColorUi(colorListUi, colorListId)
                    }
                }

            }
        });
    }

    if (colorUi.length > 0) {
        /**
         *checks how many shape layers there are in the animation and building the color-picker UI
         */
        createColorUi(colorUi, colorId)
    }
    editForm.append(`<input type="submit" name="submitChange" id="submitChange" class="btn btn-primary color-submit-btn">שנה</input>`);
    editForm.append(`<button id="dltFrameBtn" class="btn btn-primary color-submit-btn">מחק שקף</button>`);
    $('#dltFrameBtn').on('click', deleteFrameFunc);


    $('#submitChange').on('submit', changeAnim);


}




function deleteFrameFunc() {
    /**
    todo: db get deleted id and return the previous id
     we need to change done funcations because buildFrames gets  ---> check if it's works
     a = event.result ---> check this line!
     */

    let frame_id = $(".active_frame_lottie")[0].id;

    $.ajax({
        method: 'POST',
        url: '/deleteFrame',
        data: {'id': frame_id}
    }).done(buildFrames, changeFrame);

}


/**
 * gets the id of the frame that is asosiated with the working animation & sends it to server side
 * @param {object} event data to check wehre the function was called from
 * @event {onclick},{onload} when user clicks .frame_lottie OR #dltFrameBtn OR #newFrameBtn, when building the initial page
 */
function changeFrame(event) {
    let frame_id="";
   // let anim_id=""
    if(event.data!= null)
    {
        //when user clicks on a slide
        if (event.data.name === 'user_change'){
            frame_id = event.currentTarget.id;
            //anim_id = event.currentTarget.getAttribute("data-anim")
        }
    }
    else if(event.frames!=null)
    {
        // initial load
        frame_id ="frame_" +event.frames[1][0][0];

    }
    else {
        //when user delete or add new frame
        frame_id = "frame_" + event.prev_id[0];
        //anim_id = event.prev_id[2];
    }
    activeFrame(frame_id, ".frame_lottie");

    $.ajax({
        method: 'POST',
        url: '/changeFrame',
        data: {"id": frame_id}
    }).done(buildForm, buildSideNav);
}

function buildSideNav(data)
{


    let kind="empty";
    if(data.anim_kind !=null)
    {
        kind = data.anim_kind;
    }
    changeNavItem(kind);

    $.ajax({
        method: 'POST',
        url: '/getAnimations',
        data: {'kind': kind}
    }).done(buildAnim_byKind);
}

function changeNavItem(kind) {

    /* change the color of the selceted nav item */
    var indexActive = 1;
    $('.sidebar a').each(
        function () {
            if ($(this).attr('id') == "temp_" + kind) {
                $(this).children().removeClass('svgFill');
                $(this).children().addClass('svgFillActive');
                $(this).addClass('active');
                $(this).removeClass('text-white');
                $(this).parent().addClass('activeNav');
            } else {
                if ($(this).hasClass('active')) {
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
}

function buildAnim_byKind(data) {
    /**
     * todo indicate which type is now playing
     * update main animation with all props applied
     * @type {*[]}
     */

    let animations = [];
    let source;
    if (data != null) {
        for (i = 0; i < data.animations.length; i++) {
            source = data.animations[i][1];
            let animKindPlayer = `<div id="anim_${data.animations[i][2]}" class="tinyLottie anim_kind">
        <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
    speed="1"
    style="" hover loop>
    </lottie-player>
    <p class="tinyLottieDescription">${data.animations[i][0]}</p>
    </div>`;
            animations.push(animKindPlayer);
        }
    }

    $("#kindAnimationsArea").html(animations);
    $('.anim_kind').on('click', buildMain);
     activeFrame(null, ".anim_kind");
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

function activeFrame(id, name_of_class) {
    /**
     * changes the currently active lottie frame on the frames area & the same kind animations below the main
     * @param {string} id the id of the frame the user clicked on
     * @param {string} name_of_class the class of the lottie player to change to active state
     * @event onclick#
     */
    $(name_of_class).each(function (elm){
            if (this.classList.contains("active_frame_lottie")){
                this.classList.remove("active_frame_lottie")
            }
            // name_of_class = anim_lottie
            else if (this.classList.contains("active_anim_lottie")){
                this.classList.remove("active_anim_lottie")
        }
    });

    if(name_of_class === ".frame_lottie")
    {
        $('#'+id).addClass("active_frame_lottie");
    }
    else
    {
       let myid =  $(".active_frame_lottie").attr('data-anim');
        $('#anim_'+myid).addClass("active_anim_lottie");
    }
}




function addFrame(eve) {
    /**
     * @listens onclick: #newFrameBtn
     * @param {event} eve
     * @fires   loadNewFrames
     */
    eve.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/add_frame',
        data: $(this).serialize()
    }).done(loadNewFrames);
}

function loadNewFrames(data) {

    buildForm(null);
    buildFrames(data);
    changeFrame({'prev_id': data.frames[1][data.frames[1].length-1]});
}


function createColorUi(colors, colorId) {


    let colorForm = `<div id="editColor" class="col-5">
                            <div id="inputWrapper_${colorId[0]}" class="form-group color-form"></div>
                        </div>`;
    editForm.append(colorForm);
    const inputWrapper = $('#inputWrapper_' + colorId[0]);
    for (i = 0; i < colors.length; i++) {
        inputWrapper.append(colors[i]);
        $('#' + colorId[i]).colorpicker();
    }
}

function buildMain(path) {
    /**
     * takes the path for the animations and loads the main player
     * called after each update & the initial page load
     * @param {string}  path    the path to the lottie file - server side is holding {'changing_path'}
     */
    const main_animation = document.querySelector('#mainAnimation');
    main_animation.load(path);
    main_animation.src = path;
}


function getImage(name, imagePath) {
    return `<div id="editImage" enctype="multipart/form-data">
                <label for="imageUpload">העלה תמונה</label>
                <input type="file" id="${name}" name="${name}" class="btn btn-secondary" value="+">
            </div>
            <img src=${imagePath} id="displayImage"></img>`
}

function getColor(name, color) {
    /**
     * @param {string}  name    name of the animation attribute to use for HTML names
     * @param {list}    color   the color of the layer
     * @return {HTMLElement}
     */
    return `<div id=${name} class="input-group color-wrapper">
                <label for=${name}>צבע   ${name}</label>
                  <input type="hidden"  name=${name} class="form-control" value=${color.color} />
                  <span class="input-group-append">
                        <span class="colorpicker-input-addon"><i class="colorUi"></i></span>
                    </span>
            </div>`
}


function getText(name, text) {
    /**
     * @param {string}  name    name of the animation attribute to use for HTML names
     * @param {list}    color   the color of the layer
     * @return {HTMLElement}
     */
    return `<div id="editText" class="col-6">
                <div class="form-group text-form">
                    <label for="animText"> הכנס טקסט</label>
                    <div class="input-group mb-3 w-75">
                        <div class="input-group-prepend">
                            <label class="input-group-text" for="selectedAlignment">יישור</label>
                        </div>
                            <select name=${name + 'alignment'} id=${name + 'alignment'} class="custom-select" value=${text.alignment} >
                                <option value="0">שמאל</option>
                                <option value="1">ימין</option>
                                <option value="2">מרכז</option>
                            </select>
                    </div>
                    <input type="text" maxlength="24" name=${name + 'content'} id=${name + 'content'} name="animText" value="${text.content}" class="form-control">
                </div>
                <div class="form-group">
                    <label for="textColor">בחר צבע</label>
                    <input type="color" name=${name + 'color'} id=${name + 'color'}  value=${text.color} class="form-control">\n
                </div>
            </div>`;
}

/***    Runs when loading the initial page  ***/


function changeAnim(eve) {
    /**
     * @param {event} eve
     * @fires   loadColorProps
     * @listens onsubmit: #editColor
     */
    eve.preventDefault();
    const form_data = new FormData(editForm[0]);
    const mainAnimationPath = document.querySelector('#mainAnimation').src;
    form_data.append('path', mainAnimationPath);

    $.ajax({
        processData: false,
        contentType: false,
        method: 'POST',
        url: '/changeAnim',
        data: form_data
    }).done(loadColorProps);
}

function changeImage(eve) {
    /**
     * @param {event} eve
     * @fires   loadImageProps
     * @listens onsubmit: #editImage
     */
    const file_data = $('#image').prop('files')[0];
    const form_data = new FormData();
    form_data.append('file', file_data);
    eve.preventDefault();
    $.ajax({
        processData: false,
        contentType: false,
        method: 'POST',
        url: '/changeAnimImage',
        data: new FormData(document.querySelector("#editImage"))
    }).done(loadImageProps);
}

function changeText(eve) {
    /**
     * @param {event} eve
     * @fires   loadTextProps
     * @listens onsubmit: #editText
     */
    eve.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/changeAnimText',
        data: $(this).serialize()
    }).done(loadTextProps);
}


function loadImageProps(data) {
    let imagePath = data.result.image.image_path;
    let path = data.result.path;

    $('#displayImage').attr('src', imagePath);

    buildMain(path);


}

function loadTextProps(data) {
    /**
     * @param   {JSON}  data    the data recieved by the server holding the animation properties
     * Description. generates a new animation on server side with the new color. changes the UI accordingly
     */
    let alignment = data.result.text.alignment;
    let content = data.result.text.content;
    let color = data.result.text.color;
    let path = data.result.path;


    buildMain(path)

}

function loadColorProps(data) {
    /**
     * @param   {JSON}  data    the data recieved by the server holding the animation properties
     * Description. generates a new animation on server side with the new color. changes the UI accordingly
     */
    if (data.primary){
        $('#primary input').attr('value', data.primary.color);
    }
    else if (data.secondary){
        $('#secondary input').attr('value', data.secondary.color);
    }
    else if (data.text){
        $('#textalignment').attr('selectedIndex', text.alignment);
        $('#textcontent').attr('value', text.content);
        $('#textcolor').attr('value', text.color);
    }

    buildMain(data.path);

    $('#primary').colorpicker();
    $('#secondary').colorpicker()
}