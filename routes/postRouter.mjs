import { Router } from "express";
import validatePostData from "../middleware/postValidate.mjs";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.mjs";

const postRouter = Router();

postRouter.post("/", validatePostData, createPost);
postRouter.get("/", getAllPosts);
postRouter.get("/:postId", getPostById);
postRouter.put("/:postId", validatePostData, updatePost);
postRouter.delete("/:postId", deletePost);

export default postRouter;