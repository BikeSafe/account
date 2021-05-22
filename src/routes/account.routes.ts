import { Router } from "express";
import { isAuth, login, logout } from "../controller/user/login";
import {
  getuser,
  getUsers,
  getUsersbyUids,
  profile,
  register,
  updateUser,
} from "../controller/user/user";

const router = Router();

router.get("/users", getUsers);
router.get("/user/:uid", getuser);
router.get("/profile", profile);
router.get("/isauth", isAuth);
router.get("/users/uids", getUsersbyUids);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.put("/user", updateUser);
export default router;
