"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationServiceSchema1747653537008 = void 0;
class MigrationServiceSchema1747653537008 {
    constructor() {
        this.name = 'MigrationServiceSchema1747653537008';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_ages"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_genders"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_pet_ages" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_pet_genders" smallint array NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_pet_genders"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "allowed_pet_ages"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_genders" smallint array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "allowed_ages" jsonb NOT NULL`);
    }
}
exports.MigrationServiceSchema1747653537008 = MigrationServiceSchema1747653537008;
