import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class RenameOrdersUserIdToOwnerColumn1747284029968 implements MigrationInterface {
    name = 'RenameOrdersUserIdToOwnerColumn1747284029968';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 更名欄位
        await queryRunner.renameColumn("orders", "user_id", "owner_id");

        // 2. 刪除舊的外鍵約束 (假設名稱是 "FK_e5e3453db50ea9de6f0e4bfec10")
        //    請將 "FK_e5e3453db50ea9de6f0e4bfec10" 替換為您實際的外鍵約束名稱
        try {
            await queryRunner.dropForeignKey("orders", "FK_e5e3453db50ea9de6f0e4bfec10");
        } catch (error) {
            console.warn("Warning: Could not drop foreign key FK_e5e3453db50ea9de6f0e4bfec10. It might not exist.");
        }

        // 3. 創建新的外鍵約束，使用新的欄位名稱 "owner_id"
        await queryRunner.createForeignKey("orders", new TableForeignKey({
            name: "FK_orders_owner_id_users", // 建議使用一個新的、更具描述性的名稱
            columnNames: ["owner_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. 刪除新的外鍵約束
        await queryRunner.dropForeignKey("orders", "FK_orders_owner_id_users");

        // 2. 重新創建舊的外鍵約束 (如果存在)
        await queryRunner.createForeignKey("orders", new TableForeignKey({
            name: "FK_e5e3453db50ea9de6f0e4bfec10", // 使用原始的外鍵約束名稱
            columnNames: ["owner_id"], // 注意這裡使用的是更名後的欄位名稱
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
        }));

        // 3. 將欄位名稱改回 "user_id"
        await queryRunner.renameColumn("orders", "owner_id", "user_id");
    }
}