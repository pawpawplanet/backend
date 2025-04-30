const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'ServiceType',
  tableName: 'ServiceType',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
      unique: true, 
    },

    // description: {
    //   type: 'text',
    //   nullable: true,
    // },

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
    services: {  // 這是反向關聯，表示一個服務類型可以對應多個服務
      type: 'one-to-many',
      target: 'Service',
      inverseSide: 'service_type',
    },
  },
})

