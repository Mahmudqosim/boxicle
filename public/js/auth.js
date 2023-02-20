const inputEl = document.querySelector(".auth__form-password input")
const showPassword = document.querySelector(".auth__form-password .show")

showPassword.addEventListener("click", () => {
  if (inputEl.type === "password") {
    inputEl.type = "text"
    showPassword.classList.remove("bx-show")
    showPassword.classList.add("bx-hide")
  } else if (inputEl.type === "text") {
    inputEl.type = "password"
    showPassword.classList.remove("bx-hide")
    showPassword.classList.add("bx-show")
  }
})
