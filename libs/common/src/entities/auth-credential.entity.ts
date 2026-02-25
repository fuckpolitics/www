import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('auth_credentials')
export class AuthCredential {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;
}
