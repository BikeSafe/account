import { hash } from "bcryptjs";
import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { TokenWhiteList } from "../../entity/accountTokenWhiteList";
import { getRepository, In } from "typeorm";
import { User } from "../../entity/User";
import { ProfileResponse } from "../../types/ProfileResponse";

export const getUsers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const users = await getRepository(User).find();
  const responses = users.map((user) => {
    const response = new ProfileResponse();
    response.id = user.id;
    response.uid = user.uid;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.age = user.age;
    response.email = user.email;
    return response;
  });

  return res.json(responses);
};
export const getuser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const uid = req.params.uid;
  const user = await User.findOne({ where: { uid } });
  const response = new ProfileResponse();
  if (user) {
    response.id = user.id;
    response.uid = user.uid;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.age = user.age;
    response.email = user.email;
  }
  return res.json(response);
};
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newuserdata: User = req.body;
  const hashedPassword = await hash(newuserdata.password, 12);
  newuserdata.password = hashedPassword;
  try {
    const user = await getRepository(User).insert(newuserdata);
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.json({ msg: "error when creating user" });
  }
};
export const profile = async (
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
    const response = new ProfileResponse();
    response.uid = user.uid;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.age = user.age;
    response.email = user.email;
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.json("");
  }
};

export const getUsersbyUids = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let uids = req.body.uids;
  const users = await User.find({ where: { uid: In(uids) } });
  const responses = users.map((user) => {
    const response = new ProfileResponse();
    response.id = user.id;
    response.uid = user.uid;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.age = user.age;
    response.email = user.email;
    return response;
  });

  return res.json(responses);
};
