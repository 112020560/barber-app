import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769637663277 implements MigrationInterface {
    name = 'Init1769637663277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "barber_working_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "barber_id" uuid NOT NULL, "day_of_week" integer NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_closed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f9fc2a199d8c49f7cd4f17b7316" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e484957dbded6ab29ba2ab17ff" ON "barber_working_hours" ("barber_id", "day_of_week") `);
        await queryRunner.query(`CREATE TABLE "barber_time_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "barber_id" uuid NOT NULL, "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "reason" character varying(200), CONSTRAINT "PK_691db9ccbd722ea5e2d8473ae32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "barber_working_hours" ADD CONSTRAINT "FK_5ec0e2ebf66e3a0f9cfacb6c3ce" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barber_time_blocks" ADD CONSTRAINT "FK_1b68cc9e698541a0e2b6ac47577" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barber_time_blocks" DROP CONSTRAINT "FK_1b68cc9e698541a0e2b6ac47577"`);
        await queryRunner.query(`ALTER TABLE "barber_working_hours" DROP CONSTRAINT "FK_5ec0e2ebf66e3a0f9cfacb6c3ce"`);
        await queryRunner.query(`DROP TABLE "barber_time_blocks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e484957dbded6ab29ba2ab17ff"`);
        await queryRunner.query(`DROP TABLE "barber_working_hours"`);
    }

}
