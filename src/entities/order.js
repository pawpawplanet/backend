const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'Orders',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    user_id: {  // 外鍵：指向 `User`
      type: 'uuid',
      nullable: false,
    },

    service_id: {  // 外鍵：指向 `Service`
      type: 'uuid',
      nullable: false,
    },

    freelancer_id: {  // 外鍵：指向 `Service`
      type: 'uuid',
      nullable: false,
    },

    service_date: {  // 服務日期
      type: 'timestamp',
      nullable: false,
    },

    note: {  // 註明（例如：特別需求）
      type: 'text',
      nullable: true,
    },

    status: {
      type: 'enum',
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    did_owner_close_the_order: {  // 是否由雇主關閉訂單
      type: 'boolean',
      nullable: false,
      default: false,
    },

    did_freelancer_close_the_order: {  // 是否由自由工作者關閉訂單
      type: 'boolean',
      nullable: false,
      default: false,
    },

    price: {  // 訂單金額
      type: 'int',
      nullable: false,
    },

    price_unit: {  // 訂單金額單位
      type: 'varchar',
      length: 20,
      nullable: true,
    },

    created_at: {
      type: 'timestamp',
      createDate: true,
    },

    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },

  },

  relations: {
    user: {  // `Order` 和 `User` 之間的關聯
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
      },
      cascade: ['insert', 'update'],
      eager: false,
    },

    service: {  // `Order` 和 `Service` 之間的關聯
      type: 'many-to-one',
      target: 'Service',
      joinColumn: {
        name: 'service_id',
      },
      cascade: true,
      eager: false,
    },

    freelancer: {
      type: 'many-to-one',
      target: 'Freelancer',
      joinColumn: {
        name: 'freelancer_id',
      },
      cascade: true,
      eager: false,
    },
    review: {
      type: 'one-to-one',
      target: 'Review',
      inverseSide: 'order',  // 與 Review 中的 order 對應
      cascade: true,
      eager: false,
      nullable: true,   
    }


  },
})