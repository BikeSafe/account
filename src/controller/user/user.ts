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
  if (!user) {
    res.status(404).send("could not find user");
    throw new Error("could not find user");
  }
  response.id = user.id;
  response.uid = user.uid;
  response.firstName = user.firstName;
  response.lastName = user.lastName;
  response.age = user.age;
  response.email = user.email;
  return res.json(response);
};
export const updateUser = async (
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
    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      res.status(404).send("could not find token");
      throw new Error("could not find token");
    }
    const user = await User.findOne(payload.userId);
    if (!user) {
      res.status(404).send("could not find user");
      throw new Error("could not find user");
    }
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.age = req.body.age;
    const newUser = await User.save(user);
    const response = new ProfileResponse();
    response.id = newUser.id;
    response.uid = newUser.uid;
    response.firstName = newUser.firstName;
    response.lastName = newUser.lastName;
    response.age = newUser.age;
    response.email = newUser.email;
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const newuserdata: User = req.body;
  const hashedPassword = await hash(newuserdata.password, 12);
  newuserdata.password = hashedPassword;
  const email = newuserdata.email;

  const verify = await User.findOne({ where: { email } });
  if (verify) {
    res.status(409).send("this account already exists");
    throw new Error("this account already exists");
  }
  try {
    const user = await getRepository(User).insert(newuserdata);
    return res.json({ uid: user.generatedMaps[0].uid });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};
export const profile = async (
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
    if (!user) {
      res.status(404).send("could not find user");
      throw new Error("could not find user");
    }
    const tokenWhiteList = await TokenWhiteList.findOne({ where: { token } });
    if (!tokenWhiteList) {
      res.status(404).send("could not find token");
      throw new Error("could not find token");
    }
    const response = new ProfileResponse();
    response.id = user.id;
    response.uid = user.uid;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.age = user.age;
    response.email = user.email;
    return res.json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

export const getUsersbyUids = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let uids = req.body.uids;
  try {
    const users = await User.find({ where: { uid: In(uids) } });
    if (!users.length) {
      res.status(404).send("could not find users");
      throw new Error("could nor find users");
    }
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
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
