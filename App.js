/* require("dotenv").config();

require("./db");

const express = require("express");

const app = express();


require("./config")(app);


const indexRoutes = require("./routes/index.routes");
app.use("/api/projects", indexRoutes);   // /api is not mandatory but it helps seeing at the first sight that it is an api route and not a client route


require("./error-handling")(app);

module.exports = app; */