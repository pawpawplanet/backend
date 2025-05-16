const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'orders',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    // user_id: {  // 外鍵：指向 `User`
    //   type: 'uuid',
    //   nullable: false,
    // },

    owner_id: {  // 外鍵：指向 `User`
      type: 'uuid',
      nullable: false,
    },

    service_id: {  // 外鍵：指向 `Service`
      type: 'uuid',
      nullable: false,
    },

    freelancer_id: {  // 外鍵：指向 `Freelancer`
      type: 'uuid',
      nullable: false,
    },

    pet_id: {
      type: 'uuid',
      nullable: false
    },

    // service_date: {  // 服務日期
    //   type: 'timestamp',
    //   nullable: false,
    // },

    service_date: {  // 服務日期
      type: 'date',
      nullable: false,
    },

    note: {  // 註明（例如：特別需求）
      type: 'text',
      nullable: true,
    },

    // status: {
    //   type: 'enum',
    //   enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    //   default: 'pending',
    // },

    status: {
      type: 'smallint', // 0 pending, 1 accepted, 2 paid, 3 rejected, 4 cancelled, 5 expired 6 completed
      nullable: false,
      default: 0,
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

    // price_unit: {  // 訂單金額單位
    //   type: 'varchar',
    //   length: 20,
    //   nullable: true,
    // },

    price_unit: {  // 訂單金額單位
      type: 'varchar', // 每次1小時(散步) | 每天8小時(到府照顧和日托) | 每項服務每次(美容)
      nullable: false,
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
    // user: {  // `Order` 和 `User` 之間的關聯
    //   type: 'many-to-one',
    //   target: 'User',
    //   joinColumn: {
    //     name: 'user_id',
    //   },
    //   cascade: ['insert', 'update'],
    //   eager: false,
    // },

    owner: {  // `Order` 和 `User` 之間的關聯
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'owner_id', // 這是 Order 資料表中的欄位名稱
        referencedColumnName: 'id'  // 預設就是這個
      },
      eager: false,
    },

    // service: {  // `Order` 和 `Service` 之間的關聯
    //   type: 'many-to-one',
    //   target: 'Service',
    //   joinColumn: {
    //     name: 'service_id',
    //   },
    //   cascade: true,
    //   eager: false,
    // },

    service: {  // `Order` 和 `Service` 之間的關聯
      type: 'many-to-one',
      target: 'Service',
      joinColumn: {
        name: 'service_id',
      },
      eager: false,
    },

    // freelancer: {
    //   type: 'many-to-one',
    //   target: 'Freelancer',
    //   joinColumn: {
    //     name: 'freelancer_id',
    //   },
    //   cascade: true,
    //   eager: false,
    // },

    freelancer: {
      type: 'many-to-one',
      target: 'Freelancer',
      joinColumn: {
        name: 'freelancer_id',
      },
      eager: false,
    },

    review: {
      type: 'one-to-one',
      target: 'Review',
      inverseSide: 'order',  // 與 Review 中的 order 對應
      cascade: true,
      eager: false,
      // nullable: true,   // 不需要，定義在 review's joinColumn
    }
  },
})