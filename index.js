const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const authRoute = require("./routes/auth");
const feedRoute = require("./routes/feed");
const adminRoute = require("./routes/admin");
const searchRoute = require("./routes/search");
const notificationRoute = require("./routes/notification");
const friendReqRoute = require("./routes/friendRequest");
const messageRoute = require("./routes/messege");
const errorController = require("./controllers/error");
const User = require("./models/User");

const app = express();

app.use(helmet());

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: "sessions",
});

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use("/images", express.static(__dirname + "/images"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.errorMsg = "";
  next();
});

app.use(compression());
app.use(authRoute);
app.use(feedRoute);
app.use(adminRoute);
app.use(searchRoute);
app.use(friendReqRoute);
app.use(notificationRoute);
app.use(messageRoute);

app.get("/500", errorController.get500);
app.use(errorController.get404);

const parser = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose.connect(process.env.MONGODB_URL, parser, () => {
  const server = app.listen(process.env.PORT, () => {
    console.log("Server is up!");
  });

  const { Server: SocketServer } = require("socket.io");

  const io = new SocketServer(server, {
    allowEIO3: true,
  });

  const usersMap = new Map();

  io.on("connection", (socket) => {
    socket.on("join", (room, callback) => {
      usersMap.set(room.msgSender, {
        id: socket.id,
        receiver: room.msgReceiver,
      });

      socket.join(room.sender);
      callback();
    });

    socket.on("checkUsersStatus", (userFriends, callback) => {
      const filteredUsers = userFriends.filter((friend) => {
        if (usersMap.has(friend)) {
          return friend;
        }
      });

      socket.emit("onlineUsers", filteredUsers);
    });

    socket.on("sendMessage", (data, callback) => {
      if (usersMap.has(data.receiverId)) {
        io.to(usersMap.get(data.receiverId).id).emit("message", data);
      }
      callback();
    });

    socket.on("disconnect", () => {
      usersMap.forEach((value, key) => {
        if (value.id == socket.id) {
          usersMap.delete(key);
        }
      });
    });
  });
});
