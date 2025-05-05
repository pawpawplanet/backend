const { EntitySchema } = require('typeorm');

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

      birthday: {
        type: 'date',
        nullable: true,
      },

      gender: {
        type: 'varchar',
        length: 10,
        nullable: true,
      },

      size_id: {
        type: 'uuid',
        nullable: true,
      },

      description: {
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
  });

