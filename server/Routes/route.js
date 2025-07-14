import express from "express"
import { getPresignedURL } from "../controller/image-controller.js"


const routes = express.Router()
routes.get("/", async (req, res) => {

    return res.status(200).json("Server is up and running..");
})

routes.get("/url", getPresignedURL)


export default routes;