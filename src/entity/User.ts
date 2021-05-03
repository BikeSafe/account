import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  Generated,
} from "typeorm";
import { TokenWhiteList } from "./accountTokenWhiteList";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  @Generated("uuid")
  uid: string;

  @Column("text")
  firstName: string;

  @Column("text")
  lastName: string;

  @Column()
  age: number;

  @Column("text")
  email: string;

  @Column("text")
  password: string;

  @OneToMany(() => TokenWhiteList, (tokenWhiteList) => tokenWhiteList.user)
  tokens: TokenWhiteList[];
}
