const { EntitySchema } = require('typeorm')
module.exports = new EntitySchema({
  name: 'Freelancer',
  tableName: 'freelancers',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    user_id: {  // 新增 user_id 欄位作為外鍵
      type: 'uuid',
      nullable: false, // 必須指定 user_id
    },
    
    // working_days: {
    //   type: 'varchar',// 例如 ['1', '2']
    //   array: true,
    //   nullable: true
    // },

    working_days: { // 0星期日, 1星期ㄧ ...
      type: 'smallint',
      array: true,
      nullable: false,
      default: () => '\'{}\''  // 空 array in PostgreSQL
    },

    // is_weekly_mode: {
    //   type: 'boolean',
    //   default: false,
    // },

    is_weekly_mode: {
      type: 'boolean',
      nullable: false,
      default: false,
    },

    final_working_date: {
      type: 'date',
      nullable: true, // default is NULL
    },

    bank_account: {
      type: 'jsonb',
      nullable: true,
    },

    avg_rating: {
      type: 'float',
      default: 0,
    },

    review_count: {
      type: 'int',
      default: 0,
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
    // user: {
    //   type: 'one-to-one',
    //   target: 'User',
    //   joinColumn: {
    //     name: 'user_id',
    //   },
    //   onDelete: 'CASCADE',
    //   nullable: false,
    //   eager: false,
    // },
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        nullable: false
      },
      onDelete: 'CASCADE',
      eager: false,
    },
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'freelancer',
    },

  },
})
