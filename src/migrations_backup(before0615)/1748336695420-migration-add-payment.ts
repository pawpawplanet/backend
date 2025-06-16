import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationAddPayment1748336695420 implements MigrationInterface {
    name = 'MigrationAddPayment1748336695420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "allowed_pet_size" TO "allowed_pet_sizes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "allowed_pet_sizes" TO "allowed_pet_size"`);
    }

}
