import { compare } from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../../entity/User";
import { createAccsessToken } from "../auth/auth";
import { TokenWhiteList } from "../../entity/accountTokenWhiteList";
import { verify } from "jsonwebtoken";

export const login = async (req: Request, res: Response): Promise<Response> => {
  const email = req.body.email;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(404).send("could not find user");
    throw new Error("could not find user");
  }
  const password = req.body.password;
  const valid = await compare(password, user.password);
  if (!valid) {
    res.status(401).send("bad password");
    throw new Error("bad password");
  }
  const token = await createAccsessToken(user);
  return res.send({ accesToken: token });
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    res.status(400).send("no authorization headers");
    throw new Error("no authorization headers");
  }
  try {
    const token = authorization.split(" ")[1];
    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      res.status(404).send("could not find token");
      throw new Error("could not find token");
    }
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const user = await User.findOne(payload.userId);
    await TokenWhiteList.delete(tokenWhiteList);
    return res
      .status(user ? 200 : 404)
      .send(user ? user.uid : "could not find user");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
export const isAuth = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    res.status(400).send("no authorization headers");
    throw new Error("no authorization headers");
  }
  try {
    const token = authorization.split(" ")[1];
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const user = await User.findOne(payload.userId);
    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      res.status(404).send("could not find token");
      throw new Error("could not find token");
    }
    return res
      .status(user ? 200 : 404)
      .send(user ? user.uid : "could not find user");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
