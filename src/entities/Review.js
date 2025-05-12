const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Review',
  tableName: 'reviews',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    rating: {
      type: 'int',
      nullable: false,
    },

    comment: {
      type: 'text',
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
    order: {
      type: 'one-to-one',  // 每張訂單對應一則評價
      target: 'Order',
      joinColumn: {
        name: 'order_id',
      },
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,
    },

    user: {  // 撰寫評價者（飼主）
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
      },
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,
    },

    freelancer: {  // 被評價的接案者
      type: 'many-to-one',
      target: 'Freelancer',
      joinColumn: {
        name: 'freelancer_id',
      },
      onDelete: 'CASCADE',
      nullable: false,
      eager: false,
    },
  },
})