'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(
            'Posts',
            {
                id: {
                    type: Sequelize.INTEGER, //base de datos numero entero
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                title: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "title must not be empty."}}
                },
                body: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "body must not be empty."}}
                },
                attachmentId: {
                  type: Sequelize.STRING,
                  references: {
                    model: "Attachments",
                    key: "id"
                  },
                  onUpdate: 'CASCADE',
                  onDelete: 'SET NULL'
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            { //si lo modifica algo fuerzo a q se sincronicce
                sync: {force: true}
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Posts');
    }
};

