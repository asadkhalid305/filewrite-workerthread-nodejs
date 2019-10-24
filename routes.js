const Express = require("express");
const Tasks = require("./controllers/tasks");

var routes = application => {
  application.use((req, res, next) => {
    console.log("Routes activated!");
    console.log("Authenticating Developer");
    return next();
  });

  application.post("/add", Tasks.add);
  application.get("/initiate", Tasks.perform);

  application.use((req, res, next) => {
    res.status(404).send("Route not found!");
  });
};

module.exports = routes;
