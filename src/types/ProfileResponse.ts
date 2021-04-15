import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class ProfileResponse {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => Int)
  age: number;

  @Field()
  email: string;
}
