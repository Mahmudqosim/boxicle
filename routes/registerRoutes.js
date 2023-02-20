const bcrypt = require("bcryptjs")
const express = require("express")
const User = require("../schemas/UserSchema")

const Router = express.Router()

Router.get("/", (req, res, next) => {
  const payload = {
    pageTitle: "Register",
  }

  return res.status(200).render("register", payload)
})

Router.post("/", async (req, res, next) => {
  const firstName = req.body.firstName.trim()
  const lastName = req.body.lastName.trim()
  const username = req.body.username.trim()
  const email = req.body.email.trim()
  const password = req.body.password

  let payload = {
    ...req.body,
    pageTitle: "Register",
  }

  if (firstName && lastName && username && email && password) {
    // Checks if user exists
    const user = await User.findOne({ $or: [{ username }, { email }] }).catch(
      (err) => {
        console.error(err)

        payload.errorMessage = "Something went wrong"
        return res.status(200).render("register", payload)
      }
    )

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10)

      const createdUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      })

      req.session.user = createdUser
      return res.redirect("/")
    } else {
      if (email === user.email) {
        payload.errorMessage = "Email already in use."
        return res.status(200).render("register", payload)
      } else {
        payload.errorMessage = "Username already in use."
        return res.status(200).render("register", payload)
      }
    }
  } else {
    payload.errorMessage = "Fill in all fields."
    return res.status(200).render("register", payload)
  }
})

module.exports = Router
