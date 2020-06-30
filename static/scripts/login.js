let emailInput = '';
let passwordInput = '';

$(document).ready(function() {

  const formHeader = document.querySelector("formHeader");
  const registerLink = document.querySelector("#register-tab");
  const loginLink = document.querySelector("#login-tab");
  getloginForm();
  loginLink.addEventListener('click', function(){
    getloginForm();
  });
  registerLink.addEventListener('click', function(){
    getregisterForm();
  });
});



function  validate(input, help, icon) {
  //invalid
  if (!input.checkValidity()) {
    input.classList.add("invalid");
    help.classList.remove("hidden");

    if (input.classList.contains("valid")) {
      input.classList.remove("valid");
    }
    if (!icon.classList.contains("hidden")) {
      icon.classList.add("hidden");
    }
  } else if (input.checkValidity()) {
    //valid
    help.classList.add("hidden");
    icon.classList.add("hidden");
    input.classList.add("valid");
    if (icon.classList.contains("hidden")) {
      icon.classList.remove("hidden");
    }
  }
  validateForm();
}

function validateForm() {
  const inputs = Array.from(document.querySelectorAll("input"));
  const allValid = inputs.every(function(elem) {
    return elem.checkValidity();
  });
  const submitBtn = document.querySelector("#submitBtn");
  if (allValid === true) {
    submitBtn.classList.remove("disabled");
    submitBtn.disabled = false;
    submitBtn.addEventListener("click", checkUser);
  } else {
    if (!submitBtn.classList.contains("disabled")) {
      submitBtn.classList.add("disabled");
      submitBtn.disabled = true;
    }
  }
}

function checkUser(e) {
  e.preventDefault();
  const form_data = new FormData(document.querySelector("#userForm"));
  $.ajax({
    method: "POST",
    processData: false,
    contentType: false,
    url: "/login",
    data: form_data
  }).done(formHandler);
}

function formHandler(form) {
  if (form.success === true) {
    window.location.assign("/projectPage");
  } else if (form.success === false) {
    const passwordHelp = document.querySelector("#passwordHelp");
    const passworValidIcon = document.querySelector(".valid-icon-password");
    const submitMessagePlaceholder = document.querySelector(
      "#submitMessagePlaceholder"
    );
    passwordInput.value = "";
    submitMessagePlaceholder.textContent = form.alert;
    if (form.reason === "password") {
      validate(passwordInput, passwordHelp, passworValidIcon);
    } else if (form.reason === "email") {
      const emailHelp = document.querySelector("#emailHelp");
      const emailValidIcon = document.querySelector(".valid-icon-email");
      passwordInput.value = "";
      emailInput.value = "";
      validate(passwordInput, passwordHelp, passworValidIcon);
      validate(emailInput, emailHelp, emailValidIcon);
    }
  }
  console.log(form);
}

function getloginForm(){
  document.querySelector("#register").innerHTML = '';
  document.querySelector("#login").innerHTML = 
  `
  <div class="form-header-container">
  <h1 id="header">ברוכים השבים</h1>

  <p id="submitMessagePlaceholder"></p>
</div>
<form class="col-10 pt-3" id="userForm">
  <div class="form-group email-group pb-2">
      <label for="emailInput">כתובת מייל</label>
      <span class="iconify valid-icon-email hidden" data-icon="mdi:check"
      data-inline="true"></span>
      <input type="email" class="form-control" name="email" id="emailInput"
          aria-describedby="emailHelp" placeholder="לדוגמא, oneshot@gmail.com" required>
      <small id="emailHelp" class="form-text text-danger hidden">חובה למלא שדה זה בכתובת
          מייל תקינה</small>
  </div>
  <div class="form-group password-group pb-4">
      <label for="password">סיסמה</label>

      <span id="passwordVisability"><span class="iconify password-icon" 
          data-icon="mdi:eye-off-outline" data-inline="false"></span></span>
          <span id="passwordHidden" class="hidden"><span class="iconify password-icon" 
          data-icon="mdi:eye-outline" data-inline="false"></span></span>
          <span class="iconify valid-icon-password hidden" data-icon="mdi:check"
          data-inline="true"></span>
      <input type="password" name="password" class="form-control" id="password"
          placeholder="סיסמה" required>
      <small id="passwordHelp" class="form-text text-danger hidden">חובה למלא שדה
          זה</small>
  </div>
  <button class="btn primaryBTN disabled btn-block" id="submitBtn" disabled>התחברות
      </button>
      <div class="align-self-center new_account_herf_div">
  <p class="form-text-register ">אין לך חשבון?
      <a id="register_from_login" data-toggle="tab" href="#register" role="tab" aria-controls="register">להצטרפות
      </a>
  </p>
</div>
</form>

  `

  $('#register_from_login').on("click", getregisterForm);
  const showPassword = document.querySelector("#passwordVisability");
  const hidePassword = document.querySelector("#passwordHidden");
  emailInput = document.querySelector("#emailInput");
  passwordInput = document.querySelector("#password");

  showPassword.addEventListener("click", function() {
    this.classList.add("hidden");
    hidePassword.classList.remove("hidden");
    passwordInput.type = "text";
  });

  hidePassword.addEventListener("click", function() {
    this.classList.add("hidden");
    showPassword.classList.remove("hidden");
    passwordInput.type = "password";
  });

  emailInput.addEventListener("blur", function() {
    const help = document.querySelector("#emailHelp");
    const validIcon = document.querySelector(".valid-icon-email");
    validate(this, help, validIcon);
  });

  passwordInput.addEventListener("blur", function() {
    const help = document.querySelector("#passwordHelp");
    const validIcon = document.querySelector(".valid-icon-password");
    validate(this, help, validIcon);
  });

  passwordInput.addEventListener("keyup", function() {
    const help = document.querySelector("#passwordHelp");
    const validIcon = document.querySelector(".valid-icon-password");
    validate(this, help, validIcon);
  });

  $("#login-tab").parents('li').addClass("custom-nav-item-active round_rignt")
  $("#register-tab").parents('li').removeClass("custom-nav-item-active round_left")

}

function getregisterForm(){
  $('#register-tab').tab('show') // Select third tab
  document.querySelector("#login").innerHTML = '';
  document.querySelector("#register").innerHTML = 
  `
  <div class="form-header-container">
  <h1 id="registerHeader">הרשמה</h1>

  <p id="submitMessagePlaceholder"></p>
</div>
<form class="col-10" id="userForm">
  <div class="form-group name-group pb-2">
      <label for="nameInput">שם</label>
      <span class="iconify valid-icon-name hidden" data-icon="mdi:check"
      data-inline="true"></span>
      <input type="text" class="form-control" name="name" id="nameInput"
          aria-describedby="nameHelp" placeholder="לדוגמא, ישראל ישראלי" required>
      <small id="nameHelp" class="form-text text-danger hidden">חובה למלא שדה
          זה</small>
  </div>
  <div class="form-group email-group pb-2">
      <label for="emailInput">כתובת מייל</label>
      <span class="iconify valid-icon-email hidden" data-icon="mdi:check"
      data-inline="true"></span>
      <input type="email" class="form-control" name="email" id="emailInput"
          aria-describedby="emailHelp" placeholder="לדוגמא, oneshot@gmail.com" required>

      <small id="emailHelp" class="form-text text-danger hidden">חובה למלא שדה זה
          בכתובת
          מייל תקינה</small>
  </div>
  <div class="form-group password-group pb-4">
      <label for="password">סיסמה</label>

      <span id="passwordVisability"><span class="iconify password-icon" 
          data-icon="mdi:eye-off-outline" data-inline="false"></span></span>
          <span id="passwordHidden" class="hidden"><span class="iconify password-icon" 
          data-icon="mdi:eye-outline" data-inline="false"></span></span>
          <span class="iconify valid-icon-password hidden" data-icon="mdi:check"
          data-inline="true"></span>
      <input type="password" name="password" class="form-control" id="password"
          placeholder="סיסמה" required>

      <small id="passwordHelp" class="form-text text-danger hidden">חובה למלא שדה
          זה</small>
  </div>
  <button class="btn primaryBTN disabled btn-block" id="submitBtn" disabled>התחלת עבודה
      </button>
</form>
  `
  const showPassword = document.querySelector("#passwordVisability");
  const hidePassword = document.querySelector("#passwordHidden");
  
  emailInput = document.querySelector("#emailInput");
  passwordInput = document.querySelector("#password");
  nameInput = document.querySelector("#nameInput");


  showPassword.addEventListener("click", function() {
    this.classList.add("hidden");
    hidePassword.classList.remove("hidden");
    passwordInput.type = "text";
  });

  hidePassword.addEventListener("click", function() {
    this.classList.add("hidden");
    showPassword.classList.remove("hidden");
    passwordInput.type = "password";
  });
  
  nameInput.addEventListener("blur", function() {
    const help = document.querySelector("#nameHelp");
    const validIcon = document.querySelector(".valid-icon-name");
    validate(this, help, validIcon);
  });
  
  emailInput.addEventListener("blur", function() {
    const help = document.querySelector("#emailHelp");
    const validIcon = document.querySelector(".valid-icon-email");
    validate(this, help, validIcon);
  });

  passwordInput.addEventListener("blur", function() {
    const help = document.querySelector("#passwordHelp");
    const validIcon = document.querySelector(".valid-icon-password");
    validate(this, help, validIcon);
  });

  passwordInput.addEventListener("keyup", function() {
    const help = document.querySelector("#passwordHelp");
    const validIcon = document.querySelector(".valid-icon-password");
    validate(this, help, validIcon);
  });

  $("#login-tab").parents('li').removeClass("custom-nav-item-active round_rignt");
  $("#register-tab").parents('li').addClass("custom-nav-item-active round_left");

}