const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Pet',
  tableName: 'pets',

  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },

    owner_id: {  // 這個欄位會作為外鍵來指向 User 表的 id
      type: 'uuid',
      nullable: false,
    },

    // birthday: {
    //   type: 'date',
    //   nullable: true,
    // },

    birthday: {
      type: 'date',
      nullable: false,
    },

    name: {
      type: 'varchar',
      length: '50',
      nullable: false
    },

    species_id: {
      type: 'smallint', // 0 貓 1 狗
      nullable: false
    },

    is_ligation: {
      type: 'boolean',
      nullable: false,
    },

    // gender: {
    //   type: 'varchar',
    //   length: 10,
    //   nullable: true,
    // },

    gender: {
      type: 'smallint', // 0 男生， 1 女生
      nullable: false,
    },

    // size_id: {
    //   type: 'uuid',
    //   nullable: true,
    // },

    size_id: {
      type: 'smallint', // 0 小型-10公斤以下 | 1 中型-10公斤以上，20公斤以下 | 2 大型- 20公斤以上
      nullable: false,
    },

    // description: {
    //   type: 'text',
    //   nullable: true,
    // },

    personality_description: {
      type: 'text',
      nullable: true,
    },

    health_description: {
      type: 'text',
      nullable: true,
    },

    note: {
      type: 'text',
      nullable: true,
    },

    avatar: {
      type: 'varchar',
      length: 255,
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
    owner: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'owner_id',
      },
      onDelete: 'CASCADE',
      nullable: false,
      eager: false
    },

  },
})

