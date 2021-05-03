import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class TokenWhiteList extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  token: string;

  @Column("boolean", { default: true })
  isActive: boolean = true;

  @ManyToOne(() => User, (user) => user.tokens, { cascade: true })
  user: User;
}
