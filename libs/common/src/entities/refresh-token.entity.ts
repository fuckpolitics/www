import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ type: 'varchar', length: 512 })
  token: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'bigint' })
  expiresAt: number;
}
