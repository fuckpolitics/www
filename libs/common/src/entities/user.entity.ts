import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'bigint' })
  createdAt: number;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = Date.now();
  }
}
