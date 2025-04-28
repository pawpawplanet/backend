const { EntitySchema } = require('typeorm')
module.exports = new EntitySchema({
  name: 'User',
  tableName: 'Users',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: false,
      unique: true
    },
    password: {
      type: 'varchar',
      length: 72,
      nullable: false,
      select: false
    },
    // default_role: {
    //   type: 'varchar',
    //   length: 20,
    //   nullable: true
    // },
    role: {
      type: 'varchar',
      length: 20,
      nullable: false
    },
    name: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    avatar: {
      type: 'varchar',
      length: 255,
      nullable: true
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    description: {
      type: 'text',
      nullable: true
    },
    city: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    area: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    is_active: {
      type: 'boolean',
      nullable: false,
      default: true
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
      nullable: false
    }
  },
  relations: {
    freelancerProfile: {
      type: 'one-to-one',
      target: 'Freelancer',
      inverseSide: 'user',
      joinColumn: {
        name: 'user_id', // 加上這行會更明確
      },
      cascade: true,
    },
    services: {  // 反向關聯：一個 User 可以有多個 Service
      type: 'one-to-many',
      target: 'Service',
      inverseSide: 'user',
      joinColumn: {
        name: 'user_id', // 加上這行會更明確
      },
      cascade: true,
      eager: false,
    },
    orders: {  // 反向關聯：一個 User 可以有多個 Order
      type: 'one-to-many',
      target: 'Order', // 指向 Order 表
      inverseSide: 'user', // 反向關聯名稱，這裡是 Order 表中的 user 欄位
      joinColumn: {
        name: 'user_id', // 加上這行會更明確
      },
      cascade: true,
      eager: false,
    },
  }
})

