const { getDefaultMessage } = require("../services/messageService");

function getHome(req, res) {
  res.json({
    message: getDefaultMessage(),
    status: "ok",
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHome
};
