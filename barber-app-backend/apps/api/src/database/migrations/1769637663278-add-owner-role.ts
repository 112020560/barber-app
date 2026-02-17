import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerRole1769637663278 implements MigrationInterface {
  name = 'AddOwnerRole1769637663278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add OWNER to the user_role enum
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'OWNER'`);

    // Add barber_shop_id column to users table
    await queryRunner.query(`ALTER TABLE "users" ADD "barber_shop_id" uuid`);

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_barber_shop" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_barber_shop"`);

    // Remove column
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "barber_shop_id"`);

    // Note: Removing enum values in PostgreSQL requires recreating the type
    // For simplicity, we leave the OWNER value in the enum during rollback
  }
}
