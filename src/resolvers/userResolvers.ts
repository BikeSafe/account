import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { compare, hash } from "bcryptjs";
import { User } from "../entity/User";
import { LoginResponse } from "../types/LoginResponse";
import { MyContext } from "./auth/MyContext";
import { createAccsessToken, createRefreshToken } from "./auth/auth";
import { isAuth } from "./auth/isAuth";
import { sendRefreshToken } from "./auth/sendRefreshToken";
import { getConnection } from "typeorm";
import { ProfileResponse } from "../types/ProfileResponse";
import { verify } from "jsonwebtoken";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi";
  }
  @Query(() => [User])
  users() {
    return User.find();
  }
  @Query(() => User)
  user(@Arg("id", () => Int) id: number) {
    return User.findOne({ id });
  }
  @Query(() => Boolean)
  @UseMiddleware(isAuth)
  isAuth() {
    return true;
  }
  @Query(() => ProfileResponse, { nullable: true })
  async profile(@Ctx() context: MyContext) {
    const authorization = context.req.headers["authorization"];
    if (!authorization) {
      return null;
    }
    try {
      const token = authorization.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      const user = await User.findOne(payload.userId);
      if (!user) {
        return null;
      }
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokenForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");

    return true;
  }
  @Mutation(() => Boolean)
  async register(
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("age") age: number,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({
        firstName,
        lastName,
        age,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("could not find user");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("bad password");
    }
    sendRefreshToken(res, createRefreshToken(user));
    return {
      accesToken: createAccsessToken(user),
    };
  }
}
