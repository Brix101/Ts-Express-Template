import {
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

export class Model extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public readonly id!: string;

  // timestamps
  @CreateDateColumn({
    type: "timestamp",
  })
  created_at: string;

  @UpdateDateColumn({
    type: "timestamp",
  })
  updated_at: string;

  @DeleteDateColumn({
    type: "varchar",
  })
  deleted_at?: Date;
}
