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
    $(".sidebarCol li a").on('click', changeAnimationHandler);
});

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

function changeAnimationHandler(event) {
    let event_kind = ""
    let frame_id = ""
    let selected_kind = ""
    let form_data = ""
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

    $('#newFrameBtn').on('click', frameChangeHandler);
    $('.frame_lottie').on('click', changeAnimationHandler);

}


function contentChangeHandler(data) {
    const event_kind = data.event_kind
    let frame_id = "frame_" + data.current_frame[0];
    let kind = data.kind

    buildForm(data.anim_props)
    changeActive(frame_id, ".frame_lottie");
    if (event_kind == "change_kind_click") {
        $(".active_frame_lottie").attr("data-anim", data.current_frame[5]);
    }
    changeNavItem(kind);
    buildAnim_byKind(data.animation_by_kind);
    // document.querySelector('#mainAnimation').load(data.anim_props.path);
    if (event_kind == "submitChange") {
        document.querySelector("#"+ frame_id+ " lottie-player").load(data.anim_props.path);
    }
    // document.querySelector("#" +frame_id + " lottie-player").load(data.anim_props.path);
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
        }
        // name_of_class = anim_lottie
        else if (this.classList.contains("active_anim_lottie")) {
            this.classList.remove("active_anim_lottie")
        }
    });

    if (name_of_class === ".frame_lottie") {
        $('#' + id).addClass("active_frame_lottie");
    } else {
        let myid = $(".active_frame_lottie").attr('data-anim');
        $('#anim_' + myid).addClass("active_anim_lottie");
    }
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
                    editForm.append(getText(elem, data[elem]));
                    $('#textalignment option[value=' + data[elem].alignment + ']').prop('selected', true)
                } else if (elem === 'image') {
                    editForm.append(getImage());
                } else if (elem === 'listItem') {
                    editForm.append(getText(elem, data[elem].text));
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
                        createColorUi(colorListUi, colorListId)
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
        createColorUi(colorUi, colorId)
    }
    editForm.append(`<input type="submit" name="submitChange" id="submitChange" class="btn btn-primary color-submit-btn">שנה</input>`);
    editForm.append(`<button id="dltFrameBtn" class="btn btn-primary color-submit-btn">מחק שקף</button>`);

    $('#dltFrameBtn').on('click', frameChangeHandler);
    $('#submitChange').on('click', changeAnimationHandler);

}

function getImage() {
    return `<div id="editImage" enctype="multipart/form-data">
                <label for="imageUpload">העלה תמונה</label>
                <input type="file" id="imageUpload_file" name="imageUpload_file" class="btn btn-secondary" value="+">
            </div>`
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
    if (data != null) {
        for (i = 0; i < data.length; i++) {
            source = data[i][1];
            let animKindPlayer = `<div id="anim_${data[i][2]}" class="tinyLottie anim_kind">
        <lottie-player class="tinyLottiePlayer" src=${source} background="transparent"
    speed="1"
    style="" hover loop>
    </lottie-player>
    <p class="tinyLottieDescription">${data[i][0]}</p>
    </div>`;
            animations.push(animKindPlayer);
        }
    }

    $("#kindAnimationsArea").html(animations);
    // $('.anim_kind').on('click', buildMain);
    changeActive(null, ".anim_kind");
}
