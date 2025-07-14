import express from "express";
import routes from "./Routes/route.js";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();

const port = 9090;
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", routes);

app.listen(port, () => console.log(`server started on ${port}`));
