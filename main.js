const Http = require("http");
const Express = require("express");
const BodyParser = require("body-parser");
const Mongoose = require("mongoose");

const Routes = require("./routes");
const Configurations = require("./configuration");

const application = Express();

application.use(BodyParser.json());
application.use(
  BodyParser.urlencoded({
    extended: false
  })
);

const server = Http.createServer(application);

const environment = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3010;

const mongodb = Configurations[environment];

Mongoose.connect(mongodb.url, {
  useNewUrlParser: true,
  useFindAndModify: false
});

const db = Mongoose.connection;

db.on("error", err => {
  console.error(`Error in connecting MongoDB:\n ${err}`);
});

db.on("connected", () => {
  console.log("MongoDB is up and running!");
  Routes(application);
  server.listen(port, () => {
    console.log(`Server is up and running @${port}`);
  });
});
