let editForm = "";
let deleteFrameBtn = "";


$(document).ready(function () {
    // const editForm = $('#content');
    editForm = $('#content');
    if (editForm.val() === "") {
        loadForm();
    }


    deleteFrameBtn = $('#dltFrameBtn');
    deleteFrameBtn.on('click', deleteFrameFunc)


});

function deleteFrameFunc() {


}


/***    Runs when loading the initial page  ***/
function loadForm() {
    /**
     * Ajax call to load the page from first login
     */
    $.ajax({
        method: 'POST',
        url: '/editContent',
        data: $(this).serialize()
    }).done(buildForm, buildFrames);
}

function changeFrame(event) {

    const main_animation = document.querySelector('#mainAnimation');
    $.ajax({
        method: 'POST',
        url: '/changeFrame',
        data: event.currentTarget.id
    }).done(buildForm);
    // xhttp.onreadystatechange = function () {
    //     main_animation.load(event.currentTarget.src)
    // };
    // xhttp.open("POST", "/editTemplate", true);
    // xhttp.send(event.currentTarget.src);
}


function buildFrames(data) {
    numSlides = [];
    for (i = 0; i < data.frames[1].length; i++) {
        slide = `<div id="frame_${data.frames[1][i][0]}" class="tinyLottie frame_lottie">
        <lottie-player class="tinyLottiePlayer" src=${data.frames[0]}${data.frames[1][i][1]} background="transparent"
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

    addBtn = `<div>
            <button id="newFrameBtn" class="primaryBTN">+</button>
        </div>`;
    numSlides.push(addBtn);


    $('#frames_Area').html(numSlides);
    $('#newFrameBtn').on('click', addFrame)
    $('.frame_lottie').on('click', changeFrame)

}

function addFrame(eve) {
    /**
     * @param {event} eve
     * @fires   loadFrames
     * @listens onclick: #newFrameBtn
     */
    eve.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/add_frame',
        data: $(this).serialize()
    }).done(loadNewFrames);
}

function loadNewFrames(data) {

    buildForm(null)
    buildFrames(data)
}

function buildForm(data) {
    /**
     * @param {JSON}    data    the data recieved by the server holding the animation properties
     * Description. checking the parameters of the animation and building the form accordingly
     */
    let colorUi = [];
    let colorId = [];
    // const content = $('#content');
    if (data != null) {
        Object.keys(data.result).forEach(function (elem) {
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
                $('#editText').on('submit', changeText);
                $('#textalignment option[value=' + data.result[elem].alignment + ']').prop('selected', true)
            } else if (elem === 'image') {
                editForm.append(getImage(elem), data.result[elem]);
                $('#editImage').on('submit', changeImage);
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
        });

        if (colorUi.length > 0) {
            /**
             *checks how many shape layers there are in the animation and building the color-picker UI
             */
            createColorUi(colorUi, colorId)
        }
    } else {
        editForm.html("")
    }
}


function createColorUi(colors, colorId) {


    let colorForm = `<form id="editColor" class="col-5">
                            <div id="inputWrapper_${colorId[0]}" class="form-group color-form"></div>
                             <input id="colorSubmit_${colorId[0]}" type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה"/>
                        </form>`;
    editForm.append(colorForm);
    const inputWrapper = $('#inputWrapper_' + colorId[0]);
    for (i = 0; i < colors.length; i++) {
        inputWrapper.append(colors[i]);
        $('#' + colorId[i]).colorpicker();
    }
    $('#editColor').on('submit', changeColor);
}

function buildMain(path) {
    /**
     * doesn't use the key parameter!
     * takes the path for the animations and loads the main player
     * called after each update & the initial page load
     * @param {string}  path    the path to the lottie file - server side is holding {'changing_path'}
     */
    const main_animation = document.querySelector('#mainAnimation');
    main_animation.load(path)
}


function getImage(name, imagePath) {
    return `<form id="editImage" enctype="multipart/form-data">
                <label for="imageUpload">העלה תמונה</label>
                <input type="file" id="${name}" name="${name}" class="btn btn-secondary" value="+">
                <input type="submit" class="btn" value="החלף">
            </form>
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
    return `<form id="editText" class="col-6">
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
                <input type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה">
            </form>`;
}

/***    Runs when loading the initial page  ***/


function changeColor(eve) {
    /**
     * @param {event} eve
     * @fires   loadColorProps
     * @listens onsubmit: #editColor
     */
    eve.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/changeAnimColor',
        data: $(this).serialize()
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

    $('#textalignment').attr('selectedIndex', alignment);
    $('#textcontent').attr('value', content);
    $('#textcolor').attr('value', color);
    buildMain(path)

}

function loadColorProps(data) {
    /**
     * @param   {JSON}  data    the data recieved by the server holding the animation properties
     * Description. generates a new animation on server side with the new color. changes the UI accordingly
     */
    let primary = data.result.primary.color;
    let secondary = data.result.secondary.color;
    // let color = data.result.text.color;
    let path = data.result.path;

    $('#primary input').attr('value', primary);
    $('#secondary input').attr('value', secondary);
    buildMain(path)

    $('#primary').colorpicker();
    $('#secondary').colorpicker()
}