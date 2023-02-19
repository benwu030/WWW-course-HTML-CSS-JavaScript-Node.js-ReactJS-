/*
COMP3322 Assignment 2
Creator : Wu Sen Pan 3035782372
INOTEAPP
React APP.js
*/

import React, { useState } from "react";
import "./App.css";
import $, { data } from "jquery";
import AddButton from "./heart.png";
//setup all ajax request
//send session id in the request
$.ajaxSetup({
  crossDomain: true,
  xhrFields: {
    withCredentials: true,
  },
});
function time_to_string(datetime) {
  return datetime.toTimeString().split(" ")[0] + " " + datetime.toDateString();
}
function string_to_time(str) {
  return new Date(str.split(" ").slice(1).join(" ") + " " + str.split(" ")[0]);
}

/*

LoginPage is a class for the UI of user login page
*/
class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { username: "", password: "" };
  }
  login(event) {
    event.preventDefault();
    //check if the user input anything before sending request to server
    if (this.state.username == "" || this.state.password == "")
      alert("Please enter username and password.");
    else this.props.login(this.state.username, this.state.password);
  }
  handleInputChange(event) {
    //handler for  user input credentials
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
      <div className="LoginContainer">
        <h1>iNotes Login page</h1>

        <div>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handleInputChange.bind(this)}
            />
          </div>
          <div>
            <label>password:</label>
            <input
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleInputChange.bind(this)}
            />
            <button onClick={this.login.bind(this)}>log in</button>
          </div>
        </div>
      </div>
    );
  }
}

function NoteSideBar(props) {
  //state for holding the selected note in the navbar
  const [highLighted_id, setHighLightID] = useState();

  function getNote(e) {
    e.preventDefault();
    //change the selected note in the state
    setHighLightID(e.target.id);
    props.getNote(e.target.id);
  }
  function searchNote(e) {
    //call the searchNOte function when user press enter
    if (e.key == "Enter") props.searchNote(e.target.value);
  }
  return (
    <div className="NoteSideBar">
      <div className="SearchBar">
        <input
          type="text"
          name="search"
          placeholder="Search"
          onKeyUp={searchNote}
        />
      </div>

      <div className="NavigationMenu">
        <h1>Notes ({props.noteList.length})</h1>
        <ul>
          {props.noteList.map((note) => (
            <li
              key={note._id}
              id={note._id}
              onClick={getNote}
              className={
                note._id === highLighted_id
                  ? "side_bar_item highlighted"
                  : "side_bar_item"
              }
            >
              {note.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/*
Class for each NOte in the right bar
*/
class Note extends React.Component {
  constructor(props) {
    super(props);
    //fetch note content and put it into state
    this.state = {
      noteId: this.props.note.noteInfo[0]._id,
      lastsavedtime: this.props.note.noteInfo[0].lastsavedtime,
      title: this.props.note.noteInfo[0].title,
      content: this.props.note.noteInfo[0].content,
      mode: this.props.mode,
    };
  }
  handleClick() {
    //handler when user click note content or note title
    if (this.state.mode == "display") this.setState({ mode: "edit" });
  }

  deleteNote() {
    //handler for delete button
    if (window.confirm("Confirm to delete this note?"))
      this.props.deleteNote(this.state.noteId);
  }
  saveNote() {
    //handler for save button
    const title = this.state.title;
    const noteId = this.state.noteId;
    const content = this.state.content;
    this.props.saveNote(noteId, title, content);
  }
  addNote() {
    //handler for add note button i.e. heart.png
    console.log("try to addnote");
    this.props.addNote();
  }
  cancelEditMode() {
    //handler for cancel button
    if (window.confirm("Are you sure to quit editing the note?")) {
      if (this.state.noteId === -999) {
        this.setState({ mode: "empty", title: "", content: "" });
      } else
        this.setState({
          mode: "display",
          title: this.props.note.noteInfo[0].title,
          content: this.props.note.noteInfo[0].content,
        });
    }
  }
  handleInputChange(e) {
    //handler for userinput in title or contetn
    this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    let TopButton, BottomButton, TitleInput, ContentInput;
    //TitleINput = note title view
    TitleInput = (
      <textarea
        type="text"
        name="title"
        placeholder="Note's Title"
        value={this.state.title}
        onClick={this.handleClick.bind(this)}
        onChange={this.handleInputChange.bind(this)}
        rows="1"
        cols="30"
        className="Title"
      />
    );
    //contentINput = note content view
    ContentInput = (
      <textarea
        type="text"
        name="content"
        placeholder="Note's Content"
        value={this.state.content}
        onClick={this.handleClick.bind(this)}
        onChange={this.handleInputChange.bind(this)}
        rows="30"
        cols="30"
        className="Content"
      />
    );
    //render according to the modes i.e. display , edit , empty
    if (this.state.mode == "edit") {
      //edit mode
      TopButton = (
        <div className="EditButton">
          <button onClick={this.cancelEditMode.bind(this)}>Cancel</button>
          <button onClick={this.saveNote.bind(this)}>Save</button>
        </div>
      );
      BottomButton = null;
    } else if (this.state.mode == "display") {
      TopButton = //display mode
        (
          <div className="DisplayButton">
            Last Saved Time: {this.state.lastsavedtime}{" "}
            <button onClick={this.deleteNote.bind(this)}>Delete</button>
          </div>
        );
      BottomButton = (
        <img
          onClick={this.addNote.bind(this)}
          src={AddButton}
          className="AddButton"
        />
      );
    } else {
      TopButton = null; //empty mode
      TitleInput = null;
      ContentInput = null;
      BottomButton = (
        <div>
          <img
            onClick={this.addNote.bind(this)}
            src={AddButton}
            className="AddButton Empty"
          />
        </div>
      );
    }

    return (
      <div className="Note">
        {TopButton}
        {TitleInput}
        {ContentInput}
        {BottomButton}
      </div>
    );
  }
}

//NotePage class for holding left navbar and right note
// server requests will be handled here
class NotePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      noteList: this.props.noteList,
      note: null,
      mode: "display",
    };
    this.searchstr = "";
  }
  logout() {
    if (window.confirm("Are you sure to quit editing the note and log out?"))
      this.props.logout();
  }

  getNote(noteId) {
    //get note content from server
    $.getJSON("http://localhost:3001/getnote?noteid=" + noteId).then((data) => {
      this.setState({ note: data, mode: "display" });
    });
  }
  searchNote(searchstr) {
    //get notelist content via sending search string to server
    this.searchstr = searchstr;
    $.getJSON("http://localhost:3001/searchnotes?searchstr=" + searchstr).then(
      (data) => {
        this.setState({ noteList: data });
      }
    );
  }
  saveNote(noteId, title, content) {
    // request to save a note to server
    //two case
    //new note
    if (noteId === -999) {
      $.ajax({
        type: "POST",
        url: "http://localhost:3001/addnote",
        data: {
          noteTitle: title,
          noteContent: content,
        },
      }).done((data) => {
        let newNote = {
          noteInfo: [
            {
              _id: data._id,
              lastsavedtime: data.lastsavedtime,
              title: title,
              content: content,
            },
          ],
        };
        this.searchNote(this.searchstr);
        this.setState({
          note: newNote,
          mode: "display",
        });
      });
    } else {
      //existing note
      $.ajax({
        type: "PUT",
        url: "http://localhost:3001/savenote/" + noteId,

        data: { noteTitle: title, noteContent: content },
        success: (data) => {
          //update noteList and note
          this.searchNote(this.searchstr);
          let newNote = {
            noteInfo: [
              {
                _id: noteId,
                lastsavedtime: data,
                title: title,
                content: content,
              },
            ],
          };

          this.setState({ note: newNote, mode: "display" });
        },
      });
    }
  }
  addNote() {
    // create a temporary note for user edit before sending to server
    var newNote = {
      noteInfo: [{ _id: -999, lastsavedtime: null, title: "", content: "" }],
    };

    if (this.state.mode == "edit")
      // handle the case if user create a new note but click cancel and the page is not rerendering
      newNote = {
        noteInfo: [{ _id: -999, lastsavedtime: "", title: "", content: "" }],
      };

    this.setState({ note: newNote, mode: "edit" });
  }
  deleteNote(noteId) {
    //request server to delete a note
    $.ajax({
      type: "DELETE",
      url: "http://localhost:3001/deletenote/" + noteId,
    }).done(() => {
      const newNoteList = [...this.state.noteList];
      newNoteList.splice(
        newNoteList.findIndex((note) => note._id == noteId),
        1
      );
      this.setState({ noteList: newNoteList, note: null });
    });
  }
  render() {
    let note;

    if (this.state.note == null)
      note = (
        <img
          onClick={this.addNote.bind(this)}
          src={AddButton}
          className="AddButton Empty"
        />
      );
    else {
      //use lastsavedtime as a key for react to determine should it rerendered the note
      note = (
        <Note
          key={this.state.note.noteInfo[0].lastsavedtime}
          note={this.state.note}
          saveNote={this.saveNote.bind(this)}
          deleteNote={this.deleteNote.bind(this)}
          addNote={this.addNote.bind(this)}
          mode={this.state.mode}
        />
      );
    }
    return (
      <div className="Container">
        <div className="TopInfoBar">
          <h1> iNOtes Main</h1>
          <span className="TopInfo">
            <img src={"http://localhost:3001/" + this.props.iconPath} />
            Welcome {this.state.username}
            <button onClick={this.logout.bind(this)}>log out</button>
          </span>
        </div>
        <div className="MainContent clearfix">
          <NoteSideBar
            noteList={this.state.noteList}
            getNote={this.getNote.bind(this)}
            searchNote={this.searchNote.bind(this)}
          />
          {note}
        </div>
      </div>
    );
  }
}

//Main App included all the other classes and functions
class iNoteApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      noteList: [],
    };
    this.username = "";
    this.iconPath = "";
  }
  login(username, password) {
    //handle login if succeed, set the state isLoggedIn to True
    $.post(
      "http://localhost:3001/signin",
      {
        username: username,
        password: password,
      },
      (data) => {
        if (data != "Login failure") {
          this.setState({ isLoggedIn: true, noteList: data.notes });

          this.username = data.name;
          this.iconPath = data.icon;
        } else {
          this.setState({
            isLoggedIn: false,
          });
          alert("Login failure");
        }
      }
    );
  }
  logout() {
    //handle logout, if succedd set the state isLoggedIn to false
    $.get("http://localhost:3001/logout", (data) => {
      if (data == "") {
        alert("Logout Successfully");
      }
      this.setState({ isLoggedIn: false });
    });
  }
  render() {
    let MainPage = null;
    const isLoggedIn = this.state.isLoggedIn;
    if (isLoggedIn)
      MainPage = (
        <NotePage
          logout={this.logout.bind(this)}
          username={this.username}
          iconPath={this.iconPath}
          noteList={this.state.noteList}
        />
      );
    else MainPage = <LoginPage login={this.login.bind(this)} />;
    return <div>{MainPage}</div>;
  }
}

export default iNoteApp;
