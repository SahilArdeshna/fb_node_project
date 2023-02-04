const msgSender = document.querySelector(".userId").value;
const csrfToken = document.querySelector(".csrf").value;
const appUrl = document
  .getElementById("message-script")
  .getAttribute("data-appUrl");

const socket = io(appUrl);

let msgReceiver = window.location.href.replace(`${appUrl}/messeges/`, "");
const usersMessages = [];
let result;
let friendsMap = new Map();

socket.on("message", (data) => {
  if (result) {
    msgReceiver = result.chatUser._id;
  } else {
    msgReceiver;
  }

  if (data.senderId == msgReceiver && data.receiverId == msgSender) {
    const html = `
      ${messegeReceived(data)}
    `;

    // <span>${moment(new Date().getTime()).format('h:mm a')}</span>

    const gridMessages = document.querySelector(".grid-message");
    gridMessages.insertAdjacentHTML("beforeend", html);
  }
});

const getUserData = async (receiver) => {
  if (receiver) {
    const user = await fetch(`${appUrl}/chatUser/${receiver}`);
    return await user.json();
  }
};

const messegeContainer = async (sender, receiver) => {
  result = await getUserData(receiver);

  if (result) {
    const newUrl = `${appUrl}/messeges/${result.chatUser._id}`;
    history.pushState({}, null, newUrl);

    const profileImage =
      result.chatUser.profileImage ||
      "images/profile-images/default-profile.png";

    const html = `
      <div class="wrapper">
        <header>
          <div class="container">
            <div class="left"><img src="/images/logo.svg"></div>
            <div class="middle">
              <h3>${result.chatUser.firstname} ${result.chatUser.surname}</h3>
              <p>Messenger</p>
            </div>
            <div class="right">
              <div class="username">
                <div class="settings"><img src="/images/settings.svg"></div>Patrcia Fields
              </div>
              <div class="avatar"><img src="/${profileImage}"></div>
            </div>
          </div>
        </header>

        <main>
          <div class="col-left">
            <div class="col-content">
              <div class="messages">
                ${
                  result.userFriends.length > 0
                    ? result.userFriends
                        .map(
                          (friend) => `
                    <li class="friends-list" onclick="messegeContainer('${
                      result.user._id
                    }', '${friend._id}')">
                      <div class="avatar">
                        <div id="avatar-image" class="avatar-image">
                          <div id="status" class="${
                            friendsMap.has(friend._id)
                              ? "status online"
                              : "status offline"
                          }""></div><img src="/${
                            friend.profileImage ||
                            "images/profile-images/default-profile.png"
                          }">
                        </div>
                      </div>
                      <h3>${friend.firstname} ${friend.surname}</h3>
                      <p>No saved messages.</p>
                    </li>
                  `
                        )
                        .join("")
                    : ""
                }
              </div>              
            </div>    
          </div>

          <div class="col">
            <div class="col-content" id="col-content">
                <section class="message">
                  <div class="grid-message">
                    ${
                      result.chatHistory.length > 0
                        ? result.chatHistory
                            .map((chat) => showMesseges(chat, sender, receiver))
                            .join("")
                        : ""
                    }
                  </div>
                </section>
            </div>

            <div class="col-foot">
              <div class="compose">
                  <input type="hidden" class="csrf" name="_csrf" value="${csrfToken}">
                  <input onkeypress="myFun(event, '${
                    result.chatUser._id
                  }')" type="text" placeholder="Type a message">
                  <div class="compose-dock">
                    <div class="dock"><img src="/images/picture.svg"><img src="/images/smile.svg"></div>
                  </div>
              </div>
            </div>
          </div>
          
          <div class="col-right">
            <div class="col-content">
              <div class="user-panel">
                <div class="avatar" id="avatar">
                  <div class="avatar-image">
                    <div class="${
                      friendsMap.has(result.chatUser._id)
                        ? "status online"
                        : "status offline"
                    }"></div><img src="/${profileImage}">
                  </div>
                  <h3>${result.chatUser.firstname} ${
      result.chatUser.surname
    }</h3>
                  <p>Location not defined.</p>
                </div>
              </div>   
            </div>
          </div>
        </main>
      </div>
    `;

    const domContainer = document.querySelector(".dom-container");
    const wrapper = document.querySelector(".wrapper");

    if (wrapper) {
      wrapper.parentNode.removeChild(wrapper);
      domContainer.insertAdjacentHTML("afterbegin", html);
    }
  }
};

const showMesseges = (data, sender, receiver) => {
  if (data.sender == receiver && data.receiver == sender) {
    return messegeReceived(data);
  } else {
    return messegeSent(data);
  }
};

const messegeReceived = (data) => {
  return `
    <div class="col-message-received remove">
      <div class="message-received">
        <p>${data.messege}</p>
      </div>
    </div>
  `;
};

const messegeSent = (data) => {
  return `
    <div class="col-message-sent remove">
      <div class="message-sent">
        <p>${data.messege}</p>
      </div>
    </div>
  `;
};

const myFun = async (e, friendId) => {
  if (friendId) {
    msgReceiver = friendId;
  } else {
    msgReceiver;
  }

  if (e.which === 13 || e.keyCode === 13) {
    const inputValue = e.target.value;

    if (!inputValue.trim()) {
      e.target.style.border = "1px solid red";
      return console.log("please provide value!");
    }

    e.target.style.border = "none";

    const data = {
      receiverId: msgReceiver,
      senderId: msgSender,
      messege: inputValue,
    };

    // upload messege to database
    fetch(`${appUrl}/messeges/${msgReceiver}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
      },
      body: JSON.stringify(data),
    });

    // send messege
    socket.emit("sendMessage", data, (error) => {
      if (error) {
        return console.log(error);
      }

      const html = `
        <div class="col-message-sent remove">
            <div class="message-sent">
                <p>${data.messege}</p>
            </div>
        </div>
      `;

      const gridMessages = document.querySelector(".grid-message");
      gridMessages.insertAdjacentHTML("beforeend", html);

      e.target.value = "";
    });
  }
};

socket.emit("join", { msgSender, msgReceiver }, (error) => {
  if (error) {
    return console.log(error);
  }
});

const checkUserStatus = async (receiver) => {
  result = await getUserData(receiver);

  if (!result) {
    return console.log("error: result not found!");
  }

  setInterval(() => {
    socket.emit("checkUsersStatus", result.user.friends);
  }, 1);

  socket.on("onlineUsers", (data) => {
    friendsMap.clear();
    data.forEach((friend) => {
      friendsMap.set(friend, "status online");
    });

    const avatars = document.querySelectorAll("#avatar-image");
    const avatarStatuses = document.querySelectorAll("#status");

    if (avatars.length === 0) {
      return console.log("You have no friend to show!");
    }

    if (result.userFriends.length === 0) {
      return console.log("You have no friend to show!");
    }

    result.userFriends.forEach((friend, i) => {
      let html;

      avatars.forEach((avatar, index) => {
        if (index === i) {
          if (friendsMap.has(friend._id)) {
            html = `
              <div id="status" class="status online"></div>
            `;
          } else {
            html = `
              <div id="status" class="status offline"></div>
            `;
          }

          avatarStatuses.forEach((status, indx) => {
            if (indx === i) {
              if (status.parentNode) {
                status.parentNode.removeChild(status);
              }
            }
          });

          avatar.insertAdjacentHTML("afterbegin", html);
        }
      });
    });

    // for user panel right
    const dom = `
      <div class="${
        friendsMap.has(result.chatUser._id) ? "status online" : "status offline"
      }"></div>
    `;

    const avatarImages = document.querySelectorAll(
      ".avatar:last-child .avatar-image"
    );
    const statuses = document.querySelectorAll(
      ".avatar:last-child .avatar-image:first-child .status"
    );

    statuses.forEach((status) => {
      status.parentNode.removeChild(status);
    });

    avatarImages.forEach((avatarImage) => {
      avatarImage.insertAdjacentHTML("afterbegin", dom);
    });
  });
};

checkUserStatus(msgReceiver);
