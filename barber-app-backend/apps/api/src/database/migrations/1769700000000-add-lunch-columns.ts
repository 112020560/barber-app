import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLunchColumns1769700000000 implements MigrationInterface {
    name = 'AddLunchColumns1769700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barber_working_hours" ADD "lunch_start" TIME`);
        await queryRunner.query(`ALTER TABLE "barber_working_hours" ADD "lunch_end" TIME`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barber_working_hours" DROP COLUMN "lunch_end"`);
        await queryRunner.query(`ALTER TABLE "barber_working_hours" DROP COLUMN "lunch_start"`);
    }
}
