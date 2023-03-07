import { Model } from "@/corelibs/Model";
import { Column, Entity } from "typeorm";
@Entity({
  name: "users",
})
export class UsersModel extends Model {
  @Column({
    type: "varchar",
    length: 100,
  })
  name: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  email: string;

  @Column({
    type: "varchar",
    length: 250,
  })
  password: string;
}
