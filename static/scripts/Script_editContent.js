$(document).ready(function () {
    $('#editContent').on('submit', changeAnimProps);
    // const selected_alignment = document.querySelector("#selectedAlignment");
    // selected_alignment.selectedIndex = selected_alignment.attributes["data-selected"].value;
});


function changeAnimProps(eve){
    if (eve){
        eve.preventDefault();
    }
    $.ajax({
        method: 'POST',
        url: '/changeAnimText',
        data: $(this).serialize()
      }).done(addProps);
}


function addProps(data) {
    /**
     * checks if the function was called from rendering or the 'שנה' button click
     * Adresses to the same build function with different data
     **/
    if (data.result) {
        loadTextProps(data.result);
    } else {
        loadTextProps(data);
    }
}

function loadImageProps(data){

}

function loadTextProps(data) {
    let alignment = data.text.alignment;
    let content = data.text.content;
    let color = data.text.color;
    let path = data.path;
    const main_animation = document.querySelector('#mainAnimation');

    $("#editContent").html(
        `        <div class="form-group text-form">
            <label for="animText"> הכנס טקסט</label>
            <div class="input-group mb-3 w-75">
                <div class="input-group-prepend">
                    <label class="input-group-text" for="selectedAlignment">יישור</label>
                    </div>
                    <select name=\"selectedAlignment\" class=\"custom-select\" value=${alignment} id=\"selectedAlignment\">\n                   <option value="0">שמאל</option>
                        <option value="1">ימין</option>
                        <option value="2">מרכז</option>
                    </select>
                </div>
                <input type=\"text\" maxlength=\"24\" id=\"animText\" name=\"animText\" value=\"${content}\" class=\"form-control\">\n        </div>
        <div class="form-group">
            <label for="textColor">בחר צבע</label>
            <input type=\"color\" id=\"textColor\" name=\"textColor\" value=${color} class=\"form-control\">\n
        </div>
        <input type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה">`
    );

    main_animation.load(path)
}