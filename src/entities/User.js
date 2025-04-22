const { EntitySchema } = require('typeorm')
module.exports = new EntitySchema({
  name: 'User',
  tableName: 'User',
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
    default_role: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
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
  }
})

