$(document).ready(function () {
    $('#editColor').on('submit', changeAnimProps);
    // const selected_alignment = document.querySelector("#selectedAlignment");
    // selected_alignment.selectedIndex = selected_alignment.attributes["data-selected"].value;
});


function changeAnimProps(eve){
    if (eve){
        eve.preventDefault();
    }
    $.ajax({
        method: 'POST',
        url: '/changeAnimColor',
        data: $(this).serialize()
      }).done(addProps);
}
function addProps(data) {
    /**
     * checks if the function was called from rendering or the 'שנה' button click
     * Adresses to the same build function with different data
     **/
    if (data.result) {
        loadColorProps(data.result);
    } else {
        loadColorProps(data);
    }
}

function loadColorProps(data) {
    let primeColor = data.primary.color;
    let primeopacity = data.primary.opacity;
    let secColor = data.secondary.color;
    let secopacity = data.secondary.opacity;
    let path = data.path;
    const main_animation = document.querySelector('#mainAnimation');


    $("#editColor").html(
        `<div class="form-group color-form">
            <label for="animColor">בחר צבע רקע לאנימציה</label>
            <input type="color" id="animColor" name="animColor" value=${primeColor} class="form-control">
            <label for="outlineColor">בחר צבע מסגרת לאנימציה</label>
            <input type="color" id="outlineColor" name="outlineColor" value=${secColor}  class="form-control">
            <label for="opacityRange">בחר רמת שקיפות</label>
            <div class="d-flex w-100">
                <span class="px-2">0%</span>
                <input type="range" name="opacityRange" value=${primeopacity} class="custom-range w-50" id="opacityRange" min="0" max="100">
                <span class="px-2">100%</span>
            </div>
            <input type="submit" name="submit" class="btn btn-primary color-submit-btn" value="שנה"/>

        </div>`
    );

    main_animation.load(path);
}