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
    throw new Error("could not find user");
  }
  const password = req.body.password;
  const valid = await compare(password, user.password);
  if (!valid) {
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
    throw new Error("no authorization headers");
  }
  try {
    const token = authorization.split(" ")[1];
    console.log(token);

    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      throw new Error("could not find user");
    }
    await TokenWhiteList.delete(tokenWhiteList);
  } catch (err) {
    console.log(err);
    return res.json({ ok: false });
  }
  return res.json({ ok: true });
};
export const isAuth = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    throw new Error("no authorization headers");
  }
  try {
    const token = authorization.split(" ")[1];
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const user = await User.findOne(payload.userId);
    if (!user) {
      throw new Error("could not find user");
    }
    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      throw new Error("could not find token");
    }
    return res.json({ ok: true, uid: user.uid });
  } catch (err) {
    console.log(err);
    return res.json({ ok: false });
  }
};
