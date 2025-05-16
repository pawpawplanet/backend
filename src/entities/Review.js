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

    order_id: {
      type: 'uuid',
      nullable: false,
    },

    reviewer_id: {
      type: 'uuid',
      nullable: false,
    },

    reviewee_id: {
      type: 'uuid',
      nullable: false,
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
    // order: {
    //   type: 'one-to-one',  // 每張訂單對應一則評價
    //   target: 'Order',
    //   joinColumn: {
    //     name: 'order_id',
    //   },
    //   onDelete: 'CASCADE',
    //   eager: false,
    // },

    order: {
      type: 'one-to-one',  // 每張訂單對應一則評價
      target: 'Order',
      joinColumn: {
        name: 'order_id',
        nullable: false
      },
      onDelete: 'CASCADE',
      eager: false,
    },

    // reviewer: {  // 撰寫評價者（飼主）
    //   type: 'many-to-one',
    //   target: 'User',
    //   joinColumn: {
    //     name: 'reviewer_id',
    //   },
    //   onDelete: 'CASCADE',
    //   nullable: false,
    //   eager: false,
    // },

    reviewer: {  // 撰寫評價者（飼主）
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'reviewer_id',
        nullable: false
      },
      onDelete: 'CASCADE',
      eager: false,
    },

    // reviewee: {  // 被評價的接案者
    //   type: 'many-to-one',
    //   target: 'Freelancer',
    //   joinColumn: {
    //     name: 'reviewee_id',
    //   },
    //   onDelete: 'CASCADE',
    //   nullable: false,
    //   eager: false,
    // },

    reviewee: {  // 被評價的接案者
      type: 'many-to-one',
      target: 'Freelancer',
      joinColumn: {
        name: 'reviewee_id',
        nullable: false
      },
      onDelete: 'CASCADE',
      eager: false,
    },
  },
})