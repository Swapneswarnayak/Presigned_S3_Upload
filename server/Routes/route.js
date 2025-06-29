import express from "express"
import { getPresignedURL } from "../controller/image-controller.js"


const routes =express.Router()


routes.get("/url",getPresignedURL)


export default routes;