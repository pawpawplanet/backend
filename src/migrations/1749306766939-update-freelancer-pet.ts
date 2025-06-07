import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFreelancerPet1749306766939 implements MigrationInterface {
    name = 'UpdateFreelancerPet1749306766939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "freelancers" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "freelancers" ADD "longitude" double precision`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "avatar" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "avatar" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "latitude"`);
    }

}
