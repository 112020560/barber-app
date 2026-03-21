import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordToken1742500000000 implements MigrationInterface {
    name = 'AddResetPasswordToken1742500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_token_expiry" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token_expiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token"`);
    }
}
