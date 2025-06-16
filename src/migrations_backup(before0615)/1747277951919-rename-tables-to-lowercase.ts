import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTablesToLowercase1747277951919 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" RENAME TO "users"`);
        await queryRunner.query(`ALTER TABLE "Services" RENAME TO "services"`);
        await queryRunner.query(`ALTER TABLE "Orders" RENAME TO "orders"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "Users"`);
        await queryRunner.query(`ALTER TABLE "services" RENAME TO "Services"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "Orders"`);
    }
}
