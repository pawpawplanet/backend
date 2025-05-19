// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.Migration05151747284196418 = void 0;
// class Migration05151747284196418 {
//     constructor() {
//         this.name = 'Migration05151747284196418';
//     }
//     async up(queryRunner) {
//         await queryRunner.query(`ALTER TABLE "freelancers" DROP CONSTRAINT "FK_3d5a5a7ca7b16032cbc31129cc8"`);
//         await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_e4b0ed40bdd0f318108612c2851"`);
//         await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043"`);
//         // await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(320) NOT NULL, "password" character varying(72) NOT NULL, "role" character varying(20) NOT NULL, "name" character varying(20), "avatar" text array, "phone" character varying(20), "description" text, "city" character varying(20), "area" character varying(20), "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
//         // await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "service_id" uuid NOT NULL, "freelancer_id" uuid NOT NULL, "pet_id" uuid NOT NULL, "service_date" date NOT NULL, "note" text, "status" smallint NOT NULL DEFAULT '0', "did_owner_close_the_order" boolean NOT NULL DEFAULT false, "did_freelancer_close_the_order" boolean NOT NULL DEFAULT false, "price" integer NOT NULL, "price_unit" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
//         // await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "freelancer_id" uuid NOT NULL, "service_type_id" smallint NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "title" character varying(100) NOT NULL, "description" text, "images" character varying array NOT NULL, "allowed_pet_types" smallint array NOT NULL, "allowed_pet_size" smallint array NOT NULL, "allowed_ages" jsonb NOT NULL, "allowed_genders" smallint array NOT NULL, "price" integer NOT NULL, "price_unit" character varying NOT NULL, "extra_options" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "description"`);
//         // 改變新增欄位 name 的 not null 設定，避免 migration 失敗
//         // await queryRunner.query(`ALTER TABLE "pets" ADD "name" character varying(50) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "name" character varying(50)`);
//         // 手動加入：給現存 pet 新增的 name 欄位一個預設值
//         await queryRunner.query(`UPDATE "pets" SET "name" = 'some default name' WHERE "name" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "name" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "name" SET DEFAULT ''`); // 可選，設定後續新增資料的預設值
//         // await queryRunner.query(`ALTER TABLE "pets" ADD "species_id" smallint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "species_id" smallint`);
//         await queryRunner.query(`UPDATE "pets" SET "species_id" = 1 WHERE "species_id" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "species_id" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "species_id" SET DEFAULT 1`);
//         // await queryRunner.query(`ALTER TABLE "pets" ADD "is_ligation" boolean NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "is_ligation" boolean`);
//         await queryRunner.query(`UPDATE "pets" SET "is_ligation" = TRUE WHERE "is_ligation" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "is_ligation" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "is_ligation" SET DEFAULT FALSE`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "personality_description" text`);
//         await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "working_days"`);
//         await queryRunner.query(`ALTER TABLE "freelancers" ADD "working_days" smallint array NOT NULL DEFAULT '{}'`);
//         await queryRunner.query(`UPDATE "pets" SET "birthday" = '1970-01-01' WHERE "birthday" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "birthday" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "birthday" SET DEFAULT '1970-01-01'`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "gender"`);
//         // await queryRunner.query(`ALTER TABLE "pets" ADD "gender" smallint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "gender" smallint`);
//         await queryRunner.query(`UPDATE "pets" SET "gender" = 0 WHERE "gender" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "gender" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "gender" SET DEFAULT 0`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "size_id"`);
//         // await queryRunner.query(`ALTER TABLE "pets" ADD "size_id" smallint NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "size_id" smallint`);
//         await queryRunner.query(`UPDATE "pets" SET "size_id" = 0 WHERE "size_id" IS NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "size_id" SET NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "size_id" SET DEFAULT 0`);
//         await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5e3453db50ea9de6f0e4bfec10" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_8612f4a8dd8f756d53d2856a09a" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_ccdc3736994857a1d7b6d849e4c" FOREIGN KEY ("freelancer_id") REFERENCES "freelancers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "freelancers" ADD CONSTRAINT "FK_3d5a5a7ca7b16032cbc31129cc8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_6de9a04e0f99b89935bc87c27f3" FOREIGN KEY ("freelancer_id") REFERENCES "freelancers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_e4b0ed40bdd0f318108612c2851" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         // 手動加入要刪除的 table
//         await queryRunner.query(`DROP TABLE IF EXISTS "ServiceType" CASCADE`);
//     }
//     async down(queryRunner) {
//         await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043"`);
//         await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
//         await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_e4b0ed40bdd0f318108612c2851"`);
//         await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_6de9a04e0f99b89935bc87c27f3"`);
//         await queryRunner.query(`ALTER TABLE "freelancers" DROP CONSTRAINT "FK_3d5a5a7ca7b16032cbc31129cc8"`);
//         await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_ccdc3736994857a1d7b6d849e4c"`);
//         await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_8612f4a8dd8f756d53d2856a09a"`);
//         await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5e3453db50ea9de6f0e4bfec10"`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "size_id"`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "size_id" uuid`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "gender"`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "gender" character varying(10)`);
//         await queryRunner.query(`ALTER TABLE "pets" ALTER COLUMN "birthday" DROP NOT NULL`);
//         await queryRunner.query(`ALTER TABLE "freelancers" DROP COLUMN "working_days"`);
//         await queryRunner.query(`ALTER TABLE "freelancers" ADD "working_days" character varying array`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "personality_description"`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "is_ligation"`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "species_id"`);
//         await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "name"`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD "description" text`);
//         // await queryRunner.query(`DROP TABLE "services"`);
//         // await queryRunner.query(`DROP TABLE "orders"`);
//         // await queryRunner.query(`DROP TABLE "users"`);
//         await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_e4b0ed40bdd0f318108612c2851" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "freelancers" ADD CONSTRAINT "FK_3d5a5a7ca7b16032cbc31129cc8" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(` CREATE TABLE "ServiceType" ( "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "name" varchar(100) NOT NULL ) `);
//     }
// }
// exports.Migration05151747284196418 = Migration05151747284196418;
