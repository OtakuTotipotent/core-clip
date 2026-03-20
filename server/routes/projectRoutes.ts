import express from "express";
import {
  createProject,
  createVideo,
  deleteProject,
  getAllPublishedProjects,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/auth.js";

const projectRouter = express.Router();

projectRouter.post("/create", protect, createProject);
projectRouter.post("/video", protect, createVideo);
projectRouter.get("/published", protect, getAllPublishedProjects);
projectRouter.delete("/:projectId", protect, deleteProject);

export default projectRouter;
