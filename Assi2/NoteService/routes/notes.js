/*
COMP3322 Assignment 2
Creator : Wu Sen Pan 3035782372
INOTEAPP
Router notes.js
*/
var express = require("express");
var router = express.Router();

function time_to_string(datetime) {
  return datetime.toTimeString().split(" ")[0] + " " + datetime.toDateString();
}
function string_to_time(str) {
  return new Date(str.split(" ").slice(1).join(" ") + " " + str.split(" ")[0]);
}
router.get("/", (req, res) => {
  res.send("sss");
});

//Post for sign in
router.post("/signin", express.urlencoded({ extended: true }), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
  var col = req.db.get("userList");
  col
    .find({ name: username })
    .then((userInfos) => {
      if (userInfos.length == 0 || userInfos[0].password != password) {
        res.send("Login failure");
        throw new Error();
      } else {
        //create session here
        //save the userId as string
        req.session.userId = userInfos[0]._id.toString();
        return userInfos;
      }
    })
    .then((userInfo) => {
      //retrieve name and icon of the current user from userList
      //name userInfo[0].name icon userInfo[0].icon
      const currentUserName = userInfo[0].name;
      const iconPath = userInfo[0].icon;
      //retrieve all notes from noteList _id , lastsavedtime , title
      var noteCol = req.db.get("noteList");
      //sort the noteList

      console.log(req.session.userId);
      noteCol
        .find(
          { userId: req.session.userId },
          {
            sort: { lastsavedtime: -1 },
            fields: { _id: 1, lastsavedtime: 1, title: 1 },
          }
        )

        .then((noteInfo) => {
          noteInfo.map((note) => {
            note.lastsavedtime = time_to_string(note.lastsavedtime);
          });
          res.json({
            name: currentUserName,
            icon: iconPath,
            notes: noteInfo,
          });
        })
        .catch((err) => {
          res.send(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
//get request for logout
router.get("/logout", (req, res) => {
  req.session.userId = null;
  res.send("");
});

//get request for getnote
router.get("/getnote", (req, res) => {
  const noteid = req.query.noteid;
  const noteCol = req.db.get("noteList");
  noteCol
    .find(
      { _id: noteid },
      { fields: { _id: 1, lastsavedtime: 1, title: 1, content: 1 } }
    )
    .then((noteInfo) => {
      noteInfo.map((note) => {
        note.lastsavedtime = time_to_string(note.lastsavedtime);
      });
      res.json({ noteInfo });
    })
    .catch((err) => {
      res.send(err);
    });
});

//post request for addnote
router.post("/addnote", express.urlencoded({ extended: true }), (req, res) => {
  if (req.session.userId) {
    const noteTitle = req.body.noteTitle;
    const noteContent = req.body.noteContent;
    const noteCol = req.db.get("noteList");
    const currenttime = new Date();

    noteCol
      .insert({
        userId: req.session.userId,
        lastsavedtime: currenttime,
        title: noteTitle,
        content: noteContent,
      })
      .then((doc) => {
        doc.lastsavedtime = time_to_string(doc.lastsavedtime);

        res.json(doc);
      })
      .catch((err) => {
        res.send(err);
      });
  }
});

//put request for /savenote
//save the note to db with content in client
router.put("/savenote/:noteid", (req, res) => {
  const noteid = req.params.noteid;
  const noteTitle = req.body.noteTitle;
  const noteContent = req.body.noteContent;
  const noteCol = req.db.get("noteList");
  const currenttime = new Date();
  noteCol
    .update(
      { _id: noteid },
      {
        $set: {
          title: noteTitle,
          content: noteContent,
          lastsavedtime: currenttime,
        },
      }
    )
    .then((docs) => {
      res.send(time_to_string(currenttime));
    })
    .catch((err) => {
      res.send(err);
    });
});

// searchnotes request
//fetch the search str and return noteList to cilent
router.get("/searchnotes", (req, res) => {
  //create regex with searchstr /searchstr/
  const searchstr = new RegExp(req.query.searchstr);
  const noteCol = req.db.get("noteList");
  noteCol
    .find(
      {
        userId: req.session.userId,
        $or: [
          { title: { $regex: searchstr } },
          { content: { $regex: searchstr } },
        ],
      },
      {
        sort: { lastsavedtime: -1 },
        fields: { _id: 1, lastsavedtime: 1, title: 1 },
      }
    )
    .then((noteInfo) => {
      noteInfo.map(
        (note) => (note.lastsavedtime = time_to_string(note.lastsavedtime))
      );
      res.json(noteInfo);
    })
    .catch((err) => {
      res.send(err);
    });
});

//delete request for /deletenote
router.delete("/deletenote/:noteid", (req, res) => {
  const noteid = req.params.noteid;
  const noteCol = req.db.get("noteList");
  noteCol
    .remove({ _id: noteid })
    .then((docs) => {
      res.send("");
    })
    .catch((err) => {
      res.send(err);
    });
});
module.exports = router;
