//author Wu Sen Pan UID 3035782372
//COMP 3322 Assignment 1
function init() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("Get", "/load", true);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //reset the right column i.e. main content
      document.getElementById("albumbox").innerHTML = "";
      document.getElementById("albumbox").classList.remove("Enlarged");

      document.getElementById("sidebar_content").innerHTML = "";
      document.getElementById("navbtn").innerHTML = "";
      //invalid login
      if (this.responseText == "") {
        document.getElementById("login_form").style.display = "block";
        document.getElementById("welcome_msg").style.display = "none";
        document.getElementById("logout_btn").style.display = "none";
      } else {
        //successful login
        var json = JSON.parse(xhttp.responseText);
        //draw welcome msg and logout button
        document.getElementById("login_form").style.display = "none";
        document.getElementById("welcome_msg").style.display = "block";
        document.getElementById("welcome_msg").style.padding = "2vw";
        document.getElementById("welcome_msg").style.marginTop = "1vw";

        document.getElementById("welcome_msg").innerHTML =
          "Hello " + json.username + "!";
        document.getElementById("logout_btn").style.display = "block";
        document.getElementById("logout_btn").style.padding = "2vw";

        document.getElementById("logout_btn").innerHTML =
          '<button  onclick="logout()">log out</button>';
        //draw the side bar
        var myfriends = json.friends;
        sidebarlink = document.getElementById("sidebar_content");
        const li = document.createElement("li");

        //my album
        li.innerHTML = "My Album";
        li.dataset.username = json.username;
        li.dataset.userid = 0;
        li.onclick = (e) => {
          loadAlbum(e, 0);
        };
        sidebarlink.appendChild(li);
        //friends' album
        for (const friend of myfriends) {
          var name = friend.username;
          var id = friend._id;
          const li = document.createElement("li");
          li.innerHTML = name + "'s Album";
          li.dataset.username = name;
          li.dataset.userid = id;

          //   li.classList.toggle("selected");
          li.onclick = (e) => {
            loadAlbum(e, 0);
          };
          sidebarlink.appendChild(li);
         
        }
       
      }
    }
  };
  xhttp.send();
}

function loadAlbum(event, page) {
  //get userid from caller of the function
  const userid = event.target.dataset.userid;

  //reset whole sidebar
  var list = event.target.parentNode.getElementsByTagName("li");
  for (i = 0; i < list.length; i++) {
    list[i].classList.remove("selected");
  }
  //toggle on for selected sidebar element
  event.target.classList.add("selected");
  //send getalbum request
  fetch(`/getalbum?userid=${userid}&pagenum=${page}`).then((res) => {
    if (res.status == 200) {
      res.json().then((data) => {
        const total_num_pages = data.num_pages;
        const albums = data.my_album;

        var content = document.getElementById("albumbox");
        //reset content
        content.innerHTML = "";
        for (const album of albums) {
          //draw each album in albums' list of each friend
          var isVideo = album.url.endsWith("mp4");
          var albumbox = document.createElement("div");
          albumbox.classList.add("box");
          if (isVideo) {
            const video = document.createElement("video");
            const description = document.createElement("div");
            video.src = album.url;
            video.id = album._id;
            video.controls = true;

            const likedby = album.likedby;
            //set required data to displayvideo into dataset of each video
            video.dataset.likedby = likedby;
            video.dataset.username = event.target.dataset.username;
            video.dataset.userid = event.target.dataset.userid;
            video.onclick = (e) => {
              displayVideo(e);
            };
            albumbox.appendChild(video);
            
            //liked ppl
            if (likedby.length > 0) {
              var txt = "<div>";
              for (i = 0; i < likedby.length; i++) {
                if (i < likedby.length - 1) txt += likedby[i] + ", ";
                else txt += likedby[i];
              }
              txt += " liked the video!</div>";
              description.innerHTML += txt;

              
            }
            const likebtn = document.createElement("button");
            likebtn.textContent = "Like";
            likebtn.dataset.carry = video.id;
            likebtn.dataset.carry_type = "video";
            likebtn.onclick = (e) => {
              handleLike(e);
            };

            description.appendChild(likebtn);
            albumbox.appendChild(description);
          } else {//similar to above
            const img = document.createElement("img");
            const description = document.createElement("div");

            img.src = album.url;
            img.id = album._id;
     //set required data to displayvideo into dataset of each img
            img.dataset.username = event.target.dataset.username;
            img.dataset.userid = event.target.dataset.userid;
            img.onclick = (e) => {
              displayPhoto(e);
            };

            albumbox.appendChild(img);
            //ppl liked the pic/video
            const likedby = album.likedby;
            img.dataset.likedby = likedby;
            if (likedby.length > 0) {
              var txt = "<div>";
              for (i = 0; i < likedby.length; i++) {
                if (i < likedby.length - 1) txt += likedby[i] + ", ";
                else txt += likedby[i];
              }
              txt += " liked the photo!</div>";
              description.innerHTML += txt;
            }
            const likebtn = document.createElement("button");
            likebtn.textContent = "Like";
            likebtn.dataset.carry = img.id;
            likebtn.dataset.carry_type = "img";
            likebtn.onclick = (e) => {
              handleLike(e);
            };

            description.appendChild(likebtn);
            albumbox.appendChild(description);
          }
          
          content.appendChild(albumbox);
          //remember the page number with each album
          localStorage.setItem(event.target.dataset.username, page);
          if (total_num_pages > 1) {
            document.getElementById(
              "navbtn"
            ).innerHTML = `<button id="previous_btn"> &lt;previous</button><button id="next_btn">next></button>`;
              //create previous and next button
            var prev = document.getElementById("previous_btn");
            var next = document.getElementById("next_btn");
            prev.dataset.username = event.target.dataset.username;
            prev.dataset.userid = event.target.dataset.userid;
            next.dataset.username = event.target.dataset.username;
            next.dataset.userid = event.target.dataset.userid;
            //get the current pagenum
            prev.onclick = (event) => {
              loadAlbum(
                event,
                parseInt(localStorage.getItem(event.target.dataset.username))  - 1
              );
            };
            next.onclick = (event) => {
              
              loadAlbum(
                event,
                parseInt(localStorage.getItem(event.target.dataset.username)) + 1
              );
            };
            if (page == total_num_pages - 1) next.disabled = true;
            else next.disabled = false;

            if (page == 0) prev.disabled = true;
            else prev.disabled = false;
          } else {
            document.getElementById("navbtn").innerHTML = "";
          }
        }
      });
    }
  });
}

function displayPhoto(event) { //enlarge the photo
  //reset the right column
  var content = document.getElementById("albumbox");
  document.getElementById("navbtn").innerHTML = "";
  content.innerHTML = "";
  content.classList.add("Enlarged");
  const img = document.createElement("img");
  const description = document.createElement("div");
  img.src = event.target.src;
  img.id = event.target.id;
  const likedby = event.target.dataset.likedby;
  //cancel button
  var cancel = document.createElement("button");
  cancel.textContent = "x";
  cancel.onclick = () => {
    content.classList.remove("Enlarged");
    loadAlbum(event, localStorage.getItem(event.target.dataset.username));
  };
  content.appendChild(cancel);
  content.appendChild(img);
  //liked
  if (likedby != "") {
    var txt = "<div>";
    txt += likedby + " liked the photo!</div>";
    description.innerHTML += txt;
  }
  const likebtn = document.createElement("button");
  likebtn.textContent = "Like";
  likebtn.dataset.carry = img.id;
  likebtn.dataset.carry_type = "img";
  likebtn.onclick = (e) => {
    handleLike(e);
  };
  description.appendChild(likebtn);
  content.appendChild(description);
}

function displayVideo(event) {
  event.preventDefault();//prevent it from playing
  var content = document.getElementById("albumbox");
  document.getElementById("navbtn").innerHTML = "";
  content.innerHTML = "";
  event.target.pause();
  const video = document.createElement("video");
  const description = document.createElement("div");
  video.src = event.target.src;
  video.id = event.target.id;
  video.controls = true;
  video.autoplay = true;
  const likedby = event.target.dataset.likedby;
  //cancel button
  var cancel = document.createElement("button");
  cancel.textContent = "x";
  cancel.onclick = () => {
  
    loadAlbum(event, localStorage.getItem(event.target.dataset.username));
  };
  content.appendChild(cancel);
  content.appendChild(video);
  //liked
  if (likedby != "") {
    var txt = "<div>";
    txt += likedby + " liked the video!</div>";
    description.innerHTML += txt;
  }
  const likebtn = document.createElement("button");
  likebtn.dataset.carry = video.id;
  likebtn.dataset.carry_type = "video";
  likebtn.textContent = "Like";
  likebtn.onclick = (e) => {
    handleLike(e);
  };
  description.appendChild(likebtn);
  content.appendChild(description);
}
function handleLike(event) {//for clicking the like button
  var id = event.target.dataset.carry;
  var type = event.target.dataset.carry_type;

  //init for post request
  let init = {
    method: "POST",
    body: "photovideoid=" + id,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
  //send postlike request
  fetch("/postlike", init).then((res) => {
    if (res.status == 200) {
      res.json().then((data) => {
        
        

        var likedby = data;
        document.getElementById(id).dataset.likedby = likedby;

        var txt = "";
        for (i = 0; i < likedby.length; i++) {
          if (i < likedby.length - 1) txt += likedby[i] + ", ";
          else txt += likedby[i];
        }

        if (type == "video") txt += " liked the video!";
        else txt += " liked the photo!";
        var textmsg = event.target.previousSibling;
        if(textmsg != null){
          textmsg.innerHTML = txt;
        }
        else{//no one like the video or photo
          
          var text = document.createElement("div");
          text.innerHTML += txt;
      
          event.target.parentNode.insertBefore(text,event.target);
        }
      });
    }
  });
}

function login() {//handle login
  //get username and pwd
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username == "" || password == "") {
    alert("Please enter username and password.");
    return false;
  }
  //create xmlhttprequest
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "Login failure") {
        alert("Login failure");
      } else {
        //login successful
        var json = JSON.parse(xhttp.responseText);

        for (const friends of json.myfriends) {
          localStorage.setItem(friends, 0);
        }
        localStorage.setItem(username, 0);
        init();
      }
    }
  };
  //register header and send login request
  xhttp.open("Post", "/login", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("username=" + username + "&password=" + password);
}

function logout() {//handle logout
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "") {
        //clear localstorage before redrawing
        localStorage.clear();
        init();
      }
    }
  };
  //send logout request
  xhttp.open("Get", "/logout", true);
  xhttp.send();
}
