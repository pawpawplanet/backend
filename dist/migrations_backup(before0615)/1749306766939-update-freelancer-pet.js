"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFreelancerPet1749306766939 = void 0;
class UpdateFreelancerPet1749306766939 {
    constructor() {
        this.name = 'UpdateFreelancerPet1749306766939';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "freelancers" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "freelancers" ADD "longitude" double precision`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "avatar" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "paid_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "avatar" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "latitude"`);
    }
}
exports.UpdateFreelancerPet1749306766939 = UpdateFreelancerPet1749306766939;
