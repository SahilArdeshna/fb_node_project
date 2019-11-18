const moment = require("moment");

const feedTimeChange = feeds => {
  feeds.forEach(feed => {
    const time = moment(feed.createdAt).fromNow(true);
    if (time === "a day") {
      feed.createdTime = moment(feed.createdAt).format("LLL");
      feed.updatedTime = moment(feed.updatedAt).format("LLL");
    } else {
      feed.createdTime = time;
      feed.updatedTime = moment(feed.updatedAt).fromNow(true);
    }
  });
  return feeds;
};

module.exports = feedTimeChange;