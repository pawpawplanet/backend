import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationServiceSchema1747653537008 implements MigrationInterface {
    name = 'MigrationServiceSchema1747653537008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_ages"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_genders"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_pet_ages" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_pet_genders" smallint array NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_pet_genders"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_pet_ages"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_genders" smallint array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_ages" jsonb NOT NULL`);
    }

}
