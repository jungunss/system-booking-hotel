const express = require("express");
const app = express();
const port = 3000;
const router = require("./routers/index");

// const cors = require("cors");
// app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
