const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Payment',
  tableName: 'payments',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    order_id: {
      type: 'uuid',
      nullable: false,
    },

    payment_method: {
      type: 'smallint', // 0 信用卡，1 ATM， 2 其他
      nullable: true,
    },

    note: {
      type: 'text',
      nullable: true,
    },

    amount: {
      type: 'int',
      nullable: false,
    },

    success: {
      type: 'boolean', // nullable 表示沒有收到回覆
      nullable: true
    },

    paid_at: {
      type: 'data',
      nullable: 'true'
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
      type: 'one-to-one',
      target: 'Order',
      joinColumn: {
        name: 'order_id',
        nullable: false
      },
      onDelete: 'CASCADE',
      eager: false,
    }
  }
})