require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const { createServer } = require("http")
const bodyParser = require("body-parser")
const session = require("express-session")
const path = require('path')

const { Server } = require("socket.io")

const corsOptions = require('./config/corsOptions');
const middleware = require("./middleware")

const app = express()

const httpServer = createServer(app)

;(async () => {
  try {
    mongoose.connect(
      process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    )
  } catch (err) {
    console.error(err)
  }
})()

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

mongoose.connection.once("open", () => {
  const io = new Server(httpServer, { cors: corsOptions, pingTimeout: 60000 })

  io.on("connection", (socket) => {
    socket.on("setup", (userData) => {
      socket.join(userData._id)
      socket.emit("connected")
    })

    socket.on("join room", (room) => socket.join(room))
    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))
    socket.on("notification received", (room) =>
      socket.in(room).emit("notification received")
    )

    socket.on("new message", (newMessage) => {
      let chat = newMessage.chat

      if (!chat.users) return console.log("Chat.users not defined")

      chat.users.forEach((user) => {
        if (user._id == newMessage.sender._id) return
        socket.in(user._id).emit("message received", newMessage)
      })
    })
  })

  const PORT = process.env.PORT || 5000

  httpServer.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}.`)
  })
})

// Handle Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`)
  console.log(`Shutting down server due to ${err.name}`)
  console.log(err.stack)

  httpServer.close(() => {
    process.exit(1)
  })
})

// Handle Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`)
  console.log(`Shutting down server due to ${err.name}`)
  console.log(err.stack)

  process.exit(1)
})
