$(document).ready(function () {
    const editForm = $('#content');

    if (editForm.val() === ""){
        loadForm();
    }

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
    }).done(buildForm);
}

function buildForm(data) {
    /**
     * @param {JSON}    data    the data recieved by the server holding the animation properties
     * Description. checking the parameters of the animation and building the form accordingly
     */
    let colorUi = [];
    let colorId = [];
    const content = $('#content');
    Object.keys(data.result).forEach(function (elem) {
        if (elem === "path"){
            buildMain(elem, data.result[elem])
        }
        else if (elem === "primary"){
            colorUi.push(getColor(elem, data.result[elem]))
            colorId.push(elem)
        }
        else if (elem === "secondary"){
            colorUi.push(getColor(elem, data.result[elem]))
            colorId.push(elem)
        }
        else if (elem === "text"){
            content.append(getText(elem, data.result[elem]));
            $('#editText').on('submit', changeText);
            $('#textalignment option[value='+ data.result[elem].alignment + ']').prop('selected', true)
        }
        else if (elem === 'image') {
            content.append(getImage(elem), data.result[elem]);
            $('#editImage').on('submit', changeImage);
        }
    });

    if (colorUi.length > 0) {
        /**
         *checks how many shape layers there are in the animation and building the color-picker UI
         */
        let colorForm = `<form id="editColor">
                            <div id="inputWrapper" class="form-group color-form"></div>
                             <input id="colorSubmit" type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה"/>
                        </form>`;
        content.append(colorForm);
        const inputWrapper = $('#inputWrapper');
        for (i=0; i<colorUi.length; i++){
            inputWrapper.append(colorUi[i]);
            $('#'+colorId[i]).colorpicker();
        }
        $('#editColor').on('submit', changeColor);
    }
}


function buildMain(key, path) {
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
    return `<form id="editText">
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
                <input type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה">\`
            </form>`;

}
/***    Runs when loading the initial page  ***/


function changeColor(eve){
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

function changeText(eve){
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

    buildMain('mt', path);
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
    buildMain('mt', path)

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
    buildMain('mt', path)

    $('#primary').colorpicker();
    $('#secondary').colorpicker()
}