import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuthTables1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_credentials',
        columns: [
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'passwordHash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'token',
            type: 'varchar',
            length: '512',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('auth_credentials');
  }
}
