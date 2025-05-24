'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RenameOrdersUserIdToOwnerColumn1747284029968 = void 0
const typeorm_1 = require('typeorm')
class RenameOrdersUserIdToOwnerColumn1747284029968 {
  constructor() {
    this.name = 'RenameOrdersUserIdToOwnerColumn1747284029968'
  }
  async up(queryRunner) {
    // 1. 更名欄位
    await queryRunner.renameColumn('orders', 'user_id', 'owner_id')
    // 2. 刪除舊的外鍵約束 (假設名稱是 "FK_e5e3453db50ea9de6f0e4bfec10")
    //    請將 "FK_e5e3453db50ea9de6f0e4bfec10" 替換為您實際的外鍵約束名稱
    try {
      await queryRunner.dropForeignKey('orders', 'FK_e5e3453db50ea9de6f0e4bfec10')
    }
    catch (error) {
      console.warn('Warning: Could not drop foreign key FK_e5e3453db50ea9de6f0e4bfec10. It might not exist. error: ', error)
    }
    // 3. 創建新的外鍵約束，使用新的欄位名稱 "owner_id"
    await queryRunner.createForeignKey('orders', new typeorm_1.TableForeignKey({
      name: 'FK_orders_owner_id_users', // 建議使用一個新的、更具描述性的名稱
      columnNames: ['owner_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    }))
  }
  async down(queryRunner) {
    // 1. 刪除新的外鍵約束
    await queryRunner.dropForeignKey('orders', 'FK_orders_owner_id_users')
    // 2. 重新創建舊的外鍵約束 (如果存在)
    await queryRunner.createForeignKey('orders', new typeorm_1.TableForeignKey({
      name: 'FK_e5e3453db50ea9de6f0e4bfec10', // 使用原始的外鍵約束名稱
      columnNames: ['owner_id'], // 注意這裡使用的是更名後的欄位名稱
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    }))
    // 3. 將欄位名稱改回 "user_id"
    await queryRunner.renameColumn('orders', 'owner_id', 'user_id')
  }
}
exports.RenameOrdersUserIdToOwnerColumn1747284029968 = RenameOrdersUserIdToOwnerColumn1747284029968
