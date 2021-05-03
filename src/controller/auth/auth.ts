import { sign } from "jsonwebtoken";
import { User } from "src/entity/User";
import { getRepository } from "typeorm";
import { TokenWhiteList } from "../../entity/accountTokenWhiteList";

export const createAccsessToken = async (user: User) => {
  const token = sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!);
  const savetoken = new TokenWhiteList();
  savetoken.token = token;
  savetoken.user = user;
  const stoken = await getRepository(TokenWhiteList).save(savetoken);
  return stoken.token;
};
