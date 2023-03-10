require('dotenv').config()
const express = require("express")
const middleware = require("./middleware")
const path = require("path")
const cors = require('cors')
const bodyParser = require("body-parser")
const session = require("express-session")

const app = express()

app.set("view engine", "pug")
app.set("views", "views")

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
)

// Routes
const loginRoute = require("./routes/loginRoutes")
const registerRoute = require("./routes/registerRoutes")
const logoutRoute = require("./routes/logout")
const postRoute = require("./routes/postRoutes")
const profileRoute = require("./routes/profileRoutes")
const uploadRoute = require("./routes/uploadRoutes")
const searchRoute = require("./routes/searchRoutes")
const messagesRoute = require("./routes/messagesRoutes")
const notificationsRoute = require("./routes/notificationRoutes")

// Api routes
const postsApiRoute = require("./routes/api/posts")
const usersApiRoute = require("./routes/api/users")
const chatsApiRoute = require("./routes/api/chats")
const messagesApiRoute = require("./routes/api/messages")
const notificationsApiRoute = require("./routes/api/notifications")

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/posts", middleware.requireLogin, postRoute)
app.use("/profile", middleware.requireLogin, profileRoute)
app.use("/uploads", uploadRoute)
app.use("/search", middleware.requireLogin, searchRoute)
app.use("/messages", middleware.requireLogin, messagesRoute)
app.use("/notifications", middleware.requireLogin, notificationsRoute)

app.use("/api/posts", postsApiRoute)
app.use("/api/users", usersApiRoute)
app.use("/api/chats", chatsApiRoute)
app.use("/api/messages", messagesApiRoute)
app.use("/api/notifications", notificationsApiRoute)

app.get("/", middleware.requireLogin, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  }

  return res.status(200).render("home", payload)
})

module.exports = app