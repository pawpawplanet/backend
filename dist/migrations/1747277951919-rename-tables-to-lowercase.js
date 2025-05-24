'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RenameTablesToLowercase1747277951919 = void 0
class RenameTablesToLowercase1747277951919 {
  async up(queryRunner) {
    await queryRunner.query('ALTER TABLE "Users" RENAME TO "users"')
    await queryRunner.query('ALTER TABLE "Services" RENAME TO "services"')
    await queryRunner.query('ALTER TABLE "Orders" RENAME TO "orders"')
  }
  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "users" RENAME TO "Users"')
    await queryRunner.query('ALTER TABLE "services" RENAME TO "Services"')
    await queryRunner.query('ALTER TABLE "orders" RENAME TO "Orders"')
  }
}
exports.RenameTablesToLowercase1747277951919 = RenameTablesToLowercase1747277951919
