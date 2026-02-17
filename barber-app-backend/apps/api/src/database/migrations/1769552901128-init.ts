import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769552901128 implements MigrationInterface {
    name = 'Init1769552901128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbers" ADD CONSTRAINT "UQ_51d5f4523f06d92e18da7d97506" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "barbers" ADD CONSTRAINT "FK_51d5f4523f06d92e18da7d97506" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barbers" ADD CONSTRAINT "FK_bbd27fdb46a3fa7338830a2680e" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_67b6300c816c975d564f4a53be1" FOREIGN KEY ("barber_shop_id") REFERENCES "barber_shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_67b6300c816c975d564f4a53be1"`);
        await queryRunner.query(`ALTER TABLE "barbers" DROP CONSTRAINT "FK_bbd27fdb46a3fa7338830a2680e"`);
        await queryRunner.query(`ALTER TABLE "barbers" DROP CONSTRAINT "FK_51d5f4523f06d92e18da7d97506"`);
        await queryRunner.query(`ALTER TABLE "barbers" DROP CONSTRAINT "UQ_51d5f4523f06d92e18da7d97506"`);
    }

}
