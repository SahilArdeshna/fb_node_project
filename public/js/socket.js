const socket = io();

const msgSender = document.querySelector(".user-id").value;
const appUrl = document
  .getElementById("socket-script")
  .getAttribute("data-appUrl");

let msgReceiver;
const friendId = document.querySelector(".friend-id");
if (friendId) {
  msgReceiver = friendId.value;
}

const friendsMap = new Map();

const checkOnlieStatus = async () => {
  const data = await fetch(`${appUrl}/chatUser/${msgReceiver}`);
  const result = await data.json();
  if (!result) {
    console.log("error: result not found!");
  }

  setInterval(() => {
    socket.emit("checkUsersStatus", result.user.friends);
  }, 1);

  socket.on("onlineUsers", (data) => {
    friendsMap.clear();
    data.forEach((friend) => {
      friendsMap.set(friend, "status online");
    });

    const chatBoxs = document.querySelectorAll(".chatnameboxp1");
    const statuses = document.querySelectorAll("#status");

    if (chatBoxs === 0) {
      return console.log("You have no friends to show!");
    }

    result.userFriends.forEach((friend, i) => {
      let html;

      chatBoxs.forEach((chatBox, index) => {
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

          statuses.forEach((status, indx) => {
            if (indx === i) {
              if (status.parentNode) {
                status.parentNode.removeChild(status);
              }
            }
          });

          chatBox.insertAdjacentHTML("afterbegin", html);
        }
      });
    });
  });
};

if (msgReceiver) {
  // emit join
  socket.emit("join", { msgSender, msgReceiver }, async (error) => {
    if (error) {
      return console.log(error);
    }
  });

  // call check online status function
  checkOnlieStatus();
}
