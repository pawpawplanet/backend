const { EntitySchema } = require('typeorm')
module.exports = new EntitySchema({
  name: 'Service',
  tableName: 'services',
  
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
   
    freelancer_id: {
      type: 'uuid',
      nullable: false,  // 必須指定者的時間
    },
  

    // service_type_id: {  // 新增服務類型外鍵
    //   type: 'uuid',
    //   nullable: false,  // 必須指定服務類型
    // },

    service_type_id: {  // 新增服務類型外鍵：服務種類：0: 寵物寄宿/日托 1: 寵物散步 2:寵物美容 3:到府照顧
      type: 'smallint',
      nullable: false,  // 必須指定服務類型
    },
      
  
    enabled: {
      type: 'boolean',
      default: true,
    },
  
    title: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
  
    description: {
      type: 'text',
      nullable: true,
    },
  
    // images: {
    //   type: 'varchar', // 儲存圖片網址，格式為 'url1,url2'
    //   nullable: true,
    //   length: 255, // 根據網址長度調整
    // },

    images: {
      type: 'varchar', // 儲存圖片網址，格式為 'url1,url2'
      array: true,
      nullable: false,
    },
  
    // allowed_pet_types: {
    //   type: 'varchar', // 儲存為 'dog,cat'
    //   nullable: true,
    //   length: 255, // 根據需要調整長度
    // },
  
    allowed_pet_types: {
      type: 'smallint', // 儲存為 0 | 1
      array: true,
      nullable: false,
    },

    // allowed_pet_size: {
    //   type: 'varchar', // 儲存為 'small,medium'
    //   nullable: true,
    //   length: 255, 
    // },

    allowed_pet_size: {
      type: 'smallint', // 儲存為 0 | 1 | 2
      array: true,
      nullable: false,
    },
  
    // allowed_ages: {
    //   type: 'varchar', // 儲存為 'puppy,adult,senior'
    //   nullable: true,
    //   length: 255, 
    // },

    allowed_ages: {
      type: 'jsonb', // { min: 0, max: 15}
      nullable: false,
    },
  
    // allowed_genders: {
    //   type: 'varchar', // 儲存為 'male,female'
    //   nullable: true,
    //   length: 255,
    // },
  
    allowed_genders: {
      type: 'smallint', // 儲存為 0 | 1
      array: true,
      nullable: false,
    },

    price: {
      type: 'int',
      nullable: false,
    },
  
    // price_unit: {
    //   type: 'varchar',
    //   length: 20,
    //   nullable: true,
    // },
  
    price_unit: {  // 訂單金額單位
      type: 'varchar', // 每次1小時(散步) | 每天8小時(到府照顧和日托) | 每項服務每次(美容)
      nullable: false,
    },

    extra_options: {
      type: 'json', // 儲存附加服務選項 [{ name: '洗澡', price: 200 }, ...]
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
    // freelancer: {
    //   type: 'many-to-one', // 每個服務屬於一個自由職業者
    //   target: 'Freelancer',
    //   joinColumn: {
    //     name: 'freelancer_id', // 使用 freelancer_id 作為外鍵
    //   },
    //   cascade: ['insert', 'update'],
    //   eager: false,
    // },
    freelancer: {
      type: 'many-to-one',
      target: 'Freelancer',
      joinColumn: {
        name: 'freelancer_id',
        referencedColumnName: 'id',
        nullable: false, 
      },
      cascade: ['insert', 'update'],
      eager: false,
    },
        
    // service_type: {  
    //   type: 'many-to-one',
    //   target: 'ServiceType',
    //   joinColumn: {
    //     name: 'service_type_id',
    //   },
    //   cascade: true,
    //   eager: false,
    // },
    orders: {  // 新增與 Order 的一對多關聯
      type: 'one-to-many', // 一個 Service 可以對應多個 Order
      target: 'Order',
      inverseSide: 'service', // 在 Order 表中要設置反向關聯欄位 service
    },
  }
})
