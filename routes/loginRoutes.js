const bcrypt = require("bcryptjs")
const express = require("express")
const User = require("../schemas/UserSchema")

const Router = express.Router()

Router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: "Login",
  }
  res.status(200).render("login", payload)
})

Router.post("/", async (req, res, next) => {
  const username = req.body.username.trim()
  const password = req.body.password
  
  const payload = {
    pageTitle: "Login",
    ...req.body
  }

  if (username && password) {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password").catch((err) => {
      console.error(err)

      payload.errorMessage = "Something went wrong"
      res.status(200).render("login", payload)
    })

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (isValidPassword) {
        req.session.user = user

        return res.redirect("/")
      }
    }

    payload.errorMessage = "Incorrect Login Credentials"
    return res.status(200).render("login", payload)
  }

  
  payload.errorMessage = "Fill in all fields"
  res.status(200).render("login", payload)
})
module.exports = Router
