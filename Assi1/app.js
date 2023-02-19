//author Wu Sen Pan UID 3035782372
//COMP 3322 Assignment 1
//connecting the mongodb
var express = require("express");
var app = express();
var monk = require("monk");
var db = monk("127.0.0.1:27017/assignment1");

//make db accessible to router
app.use(function (req, res, next) {
  req.db = db;
  next();
});

//server static files
app.use(express.static("public"));

//middlewares

//set up cookie
var cookieParser = require("cookie-parser");
const e = require("express");
app.use(cookieParser());
app.disable("etag");

//HTTP GET requests for ./load
app.get("/load", (req, res) => {
  if (req.cookies.user_id) {
    var db = req.db;
    var col = db.get("userList");

    var user = col.find(
      { _id: req.cookies.user_id },
      { fields: { username: 1, friends: 1, _id: 0 } }
    );
    user
      .then((docs) => {
        var friends = docs[0].friends;
        //search id of all the friends of user
        col
          .find(
            { username: { $in: friends } },
            { fields: { _id: 1, username: 1 } }
          )
          .then((doc) => {
            res.json({ username: docs[0].username, friends: doc });
          })
          .catch((err) => {
            res.json({ err });
          });
      })
      .catch((err) => {
        res.json({ err });
      });

    //res.json({ username: username, friends: fdList });
  } else {
    res.send("");
  }
});
//POST for /login
app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  //get username and pwd from caller
  const username = req.body.username;
  const password = req.body.password;

  var col = db.get("userList");
  col
    .find({ username: username })
    .then((docs) => {
      if (docs.length == 0 || docs[0].password != password) {
        res.send("Login failure");
        throw new Error();
      } else {
        res.cookie("user_id", docs[0]._id, { maxAge: 1800000 });

        return docs;
      }
    })
    .then((docss) => {
      var friends = docss[0].friends;
      //search id of all the friends of user
      col
        .find(
          { username: { $in: friends } },
          { fields: { username: 1, _id: 1 } }
        )
        .then((doc) => {
          //send the list of all friends
          res.json({ myfriends: doc });
        })
        .catch((err) => {
          res.json({ err });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
//GET for /logout
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.send("");
});

//Get for /getalbum
const MAX_ITEMS = 2;
app.get("/getalbum", (req, res) => {
  //get _id, url, likedby if userid = 0
  var pagenum = req.query.pagenum;
  var userid = req.query.userid;
  var media = db.get("mediaList");
  if (userid == "0") {
    const current_user_id = req.cookies.user_id;
    media
      .find(
        { userid: current_user_id },
        {
          limit: MAX_ITEMS,
          skip: MAX_ITEMS * pagenum,
          fields: { _id: 1, url: 1, likedby: 1 },
        }
      )
      .then((docs) => {//count the total record a user have
        media.count({ userid: current_user_id }).then((result) => {
          var num_pages = Math.ceil(result / MAX_ITEMS);
          res.json({ num_pages: num_pages, my_album: docs });
        });
      })
      .catch((err) => {
        res.json(err);
      });
  }
  //userid != 0
  else {
    media
      .find(
        { userid: userid },
        {//find specific media
          limit: MAX_ITEMS,
          skip: MAX_ITEMS * pagenum,
          fields: { _id: 1, url: 1, likedby: 1 },
        }
      )
      .then((docs) => {
        //calculate the num_pages needed show 6 records at most
        media.count({ userid: userid }).then((result) => {
          var num_pages = Math.ceil(result / MAX_ITEMS);
          res.json({ num_pages: num_pages, my_album: docs });
        });
      })
      .catch((err) => {
        res.json(err);
      });
  }
});
//Post for post like
app.post("/postlike", express.urlencoded({ extended: true }), (req, res) => {
  photovideoid = req.body.photovideoid;

  var user_id = req.cookies.user_id;
  var user = db.get("userList");
  user.find({ _id: user_id }, { field: { username: 1 } }).then((docs) => {
    var username = docs[0].username;
    var media = db.get("mediaList");
    media.find({ _id: photovideoid }).then((doc) => {
      var likedbylist = doc[0].likedby;

      if (likedbylist.find((user) => user == username) != username) {
        //update db if username not found
        likedbylist.push(username);
        media
          .update({ _id: photovideoid }, { $set: { likedby: likedbylist } })
          .then((docss) => {
            res.send(likedbylist);
          })
          .catch((err) => {
            res.send(err);
          });
      } else {
        res.send(likedbylist);
      }
    });
  });
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/" + "albums.html");
});

var server = app.listen(8081, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
