'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.Migrations1747397539890 = void 0
class Migrations1747397539890 {
  constructor() {
    this.name = 'Migrations1747397539890'
  }
  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_dc5e935acf7f799190657601698"')
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"')
    await queryRunner.query('ALTER TABLE "reviews" DROP COLUMN "user_id"')
    await queryRunner.query('ALTER TABLE "reviews" DROP COLUMN "freelancer_id"')
    await queryRunner.query('ALTER TABLE "reviews" ADD "reviewer_id" uuid NOT NULL')
    await queryRunner.query('ALTER TABLE "reviews" ADD "reviewee_id" uuid NOT NULL')
    await queryRunner.query('ALTER TABLE "reviews" ADD CONSTRAINT "FK_92e950a2513a79bb3fab273c92e" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "reviews" ADD CONSTRAINT "FK_a7b3e1afadd6b52f3b6864745e3" FOREIGN KEY ("reviewee_id") REFERENCES "freelancers"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
  }
  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_a7b3e1afadd6b52f3b6864745e3"')
    await queryRunner.query('ALTER TABLE "reviews" DROP CONSTRAINT "FK_92e950a2513a79bb3fab273c92e"')
    await queryRunner.query('ALTER TABLE "reviews" DROP COLUMN "reviewee_id"')
    await queryRunner.query('ALTER TABLE "reviews" DROP COLUMN "reviewer_id"')
    await queryRunner.query('ALTER TABLE "reviews" ADD "freelancer_id" uuid NOT NULL')
    await queryRunner.query('ALTER TABLE "reviews" ADD "user_id" uuid NOT NULL')
    await queryRunner.query('ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
    await queryRunner.query('ALTER TABLE "reviews" ADD CONSTRAINT "FK_dc5e935acf7f799190657601698" FOREIGN KEY ("freelancer_id") REFERENCES "freelancers"("id") ON DELETE CASCADE ON UPDATE NO ACTION')
  }
}
exports.Migrations1747397539890 = Migrations1747397539890
