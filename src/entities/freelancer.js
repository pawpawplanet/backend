const { EntitySchema } = require('typeorm');
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
    
    working_days: {
      type: 'json', // 例如 ['Monday', 'Tuesday']
      nullable: true,
    },
    is_weekday_mode: {
      type: 'boolean',
      default: false,
    },
    final_working_date: {
      type: 'date',
      nullable: true,
    },
    bank_account: {
      type: 'varchar',
      length: 50,
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
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
      },
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,
    },
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'freelancer',
    },

  },
});
