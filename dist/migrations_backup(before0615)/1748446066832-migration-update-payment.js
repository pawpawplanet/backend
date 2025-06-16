"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationUpdatePayment1748446066832 = void 0;
class MigrationUpdatePayment1748446066832 {
    constructor() {
        this.name = 'MigrationUpdatePayment1748446066832';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "payment_method" smallint, "note" text, "amount" integer NOT NULL, "success" boolean, "paid_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b2f7b823a21562eeca20e72b00" UNIQUE ("order_id"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }
}
exports.MigrationUpdatePayment1748446066832 = MigrationUpdatePayment1748446066832;
