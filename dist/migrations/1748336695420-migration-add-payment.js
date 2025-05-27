"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationAddPayment1748336695420 = void 0;
class MigrationAddPayment1748336695420 {
    constructor() {
        this.name = 'MigrationAddPayment1748336695420';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "allowed_pet_size" TO "allowed_pet_sizes"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "services" RENAME COLUMN "allowed_pet_sizes" TO "allowed_pet_size"`);
    }
}
exports.MigrationAddPayment1748336695420 = MigrationAddPayment1748336695420;
