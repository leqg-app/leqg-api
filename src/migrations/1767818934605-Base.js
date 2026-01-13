/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Base1767818934605 {
    name = 'Base1767818934605'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`store\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`latitude\` decimal(8,5) NOT NULL, \`longitude\` decimal(8,5) NOT NULL, \`address\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`website\` varchar(255) NULL, \`googlePlaceId\` varchar(255) NULL, \`googleDataId\` varchar(255) NULL, \`countryCode\` varchar(255) NULL DEFAULT 'FR', \`rate\` decimal(3,2) NULL, \`rateCount\` int NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`custom\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`store_product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productName\` varchar(255) NULL, \`price\` float NULL, \`specialPrice\` float NULL, \`volume\` int NOT NULL, \`type\` varchar(255) NULL, \`currencyCode\` varchar(3) NOT NULL DEFAULT 'EUR', \`productId\` int NULL, \`storeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`schedule\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dayOfWeek\` int NOT NULL, \`opening\` int NULL, \`closing\` int NULL, \`openingSpecial\` int NULL, \`closingSpecial\` int NULL, \`closed\` tinyint NOT NULL, \`storeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`store_revision\` (\`id\` int NOT NULL AUTO_INCREMENT, \`version\` int NOT NULL, \`changes\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`storeId\` int NULL, \`contributionId\` int NULL, UNIQUE INDEX \`REL_badf975a873ae12be0a7e38d0b\` (\`contributionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`provider\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`resetPasswordToken\` varchar(255) NULL, \`confirmationToken\` varchar(255) NULL, \`confirmed\` tinyint NOT NULL DEFAULT 0, \`blocked\` tinyint NULL DEFAULT 0, \`role\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`contribution\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reputation\` int NOT NULL DEFAULT '0', \`reason\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`currency_rate\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`rate\` float NOT NULL, UNIQUE INDEX \`IDX_fb34d34882bdea531808c47dce\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`feature_category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_407dc990403e17d5321783dc7e\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`feature\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`featureCategoryId\` int NULL, UNIQUE INDEX \`IDX_4832be692a2dc63d67e8e93c75\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rate\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rate1\` decimal(3,2) NOT NULL, \`rate2\` decimal(3,2) NOT NULL, \`rate3\` decimal(3,2) NOT NULL, \`comment\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`storeId\` int NULL, \`contributionId\` int NULL, UNIQUE INDEX \`REL_0b9e94fc51e078951f5533647c\` (\`contributionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`store_validation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`latitude\` decimal(8,5) NOT NULL, \`longitude\` decimal(8,5) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`storeId\` int NULL, \`contributionId\` int NULL, UNIQUE INDEX \`REL_83b6b296f773228213fd4d50e6\` (\`contributionId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`version\` (\`name\` varchar(255) NOT NULL, \`version\` int NOT NULL, \`count\` int NOT NULL DEFAULT '0', \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_181af7d2a9dc0ce81f0a0d1980\` (\`name\`), PRIMARY KEY (\`name\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`store_features_feature\` (\`storeId\` int NOT NULL, \`featureId\` int NOT NULL, INDEX \`IDX_2b5b9f6c8f2697b9b79126a2f1\` (\`storeId\`), INDEX \`IDX_0094095d59ef09a9803eabbc89\` (\`featureId\`), PRIMARY KEY (\`storeId\`, \`featureId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_favorites_store\` (\`userId\` int NOT NULL, \`storeId\` int NOT NULL, INDEX \`IDX_87caa58559fb3f27fe99043c45\` (\`userId\`), INDEX \`IDX_75855ace632fa9313cd34f8b2c\` (\`storeId\`), PRIMARY KEY (\`userId\`, \`storeId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rate_recommended_products_store_product\` (\`rateId\` int NOT NULL, \`storeProductId\` int NOT NULL, INDEX \`IDX_77c33401aa365dc19139573a72\` (\`rateId\`), INDEX \`IDX_2af5b31f918a0a3f7e0e15242d\` (\`storeProductId\`), PRIMARY KEY (\`rateId\`, \`storeProductId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`store_product\` ADD CONSTRAINT \`FK_8988ebd2c1c321738c3bfa4c9b4\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_product\` ADD CONSTRAINT \`FK_13e275149d7414c2694da12dcf7\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedule\` ADD CONSTRAINT \`FK_cf47e0d73277daf5c40be78aee7\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_revision\` ADD CONSTRAINT \`FK_aaaff2e4218eccb5f7e4f8e384e\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_revision\` ADD CONSTRAINT \`FK_0580f84f046137f1e96d30b5d06\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_revision\` ADD CONSTRAINT \`FK_badf975a873ae12be0a7e38d0b4\` FOREIGN KEY (\`contributionId\`) REFERENCES \`contribution\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`contribution\` ADD CONSTRAINT \`FK_d2084068d6246a419df6fec9d0f\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`feature\` ADD CONSTRAINT \`FK_8fcbde65f11217e54f2d5be5856\` FOREIGN KEY (\`featureCategoryId\`) REFERENCES \`feature_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rate\` ADD CONSTRAINT \`FK_7440b44c5acbec8b2ebfc3af7d2\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rate\` ADD CONSTRAINT \`FK_79be2c9ed993a3e7d725710a094\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rate\` ADD CONSTRAINT \`FK_0b9e94fc51e078951f5533647c1\` FOREIGN KEY (\`contributionId\`) REFERENCES \`contribution\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_validation\` ADD CONSTRAINT \`FK_01fc9ce75c0d3da92478c18ec71\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_validation\` ADD CONSTRAINT \`FK_6721c66a2b93001c21833a21d9d\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_validation\` ADD CONSTRAINT \`FK_83b6b296f773228213fd4d50e6e\` FOREIGN KEY (\`contributionId\`) REFERENCES \`contribution\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`store_features_feature\` ADD CONSTRAINT \`FK_2b5b9f6c8f2697b9b79126a2f1e\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`store_features_feature\` ADD CONSTRAINT \`FK_0094095d59ef09a9803eabbc894\` FOREIGN KEY (\`featureId\`) REFERENCES \`feature\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorites_store\` ADD CONSTRAINT \`FK_87caa58559fb3f27fe99043c452\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorites_store\` ADD CONSTRAINT \`FK_75855ace632fa9313cd34f8b2c5\` FOREIGN KEY (\`storeId\`) REFERENCES \`store\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rate_recommended_products_store_product\` ADD CONSTRAINT \`FK_77c33401aa365dc19139573a726\` FOREIGN KEY (\`rateId\`) REFERENCES \`rate\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rate_recommended_products_store_product\` ADD CONSTRAINT \`FK_2af5b31f918a0a3f7e0e15242d8\` FOREIGN KEY (\`storeProductId\`) REFERENCES \`store_product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`rate_recommended_products_store_product\` DROP FOREIGN KEY \`FK_2af5b31f918a0a3f7e0e15242d8\``);
        await queryRunner.query(`ALTER TABLE \`rate_recommended_products_store_product\` DROP FOREIGN KEY \`FK_77c33401aa365dc19139573a726\``);
        await queryRunner.query(`ALTER TABLE \`user_favorites_store\` DROP FOREIGN KEY \`FK_75855ace632fa9313cd34f8b2c5\``);
        await queryRunner.query(`ALTER TABLE \`user_favorites_store\` DROP FOREIGN KEY \`FK_87caa58559fb3f27fe99043c452\``);
        await queryRunner.query(`ALTER TABLE \`store_features_feature\` DROP FOREIGN KEY \`FK_0094095d59ef09a9803eabbc894\``);
        await queryRunner.query(`ALTER TABLE \`store_features_feature\` DROP FOREIGN KEY \`FK_2b5b9f6c8f2697b9b79126a2f1e\``);
        await queryRunner.query(`ALTER TABLE \`store_validation\` DROP FOREIGN KEY \`FK_83b6b296f773228213fd4d50e6e\``);
        await queryRunner.query(`ALTER TABLE \`store_validation\` DROP FOREIGN KEY \`FK_6721c66a2b93001c21833a21d9d\``);
        await queryRunner.query(`ALTER TABLE \`store_validation\` DROP FOREIGN KEY \`FK_01fc9ce75c0d3da92478c18ec71\``);
        await queryRunner.query(`ALTER TABLE \`rate\` DROP FOREIGN KEY \`FK_0b9e94fc51e078951f5533647c1\``);
        await queryRunner.query(`ALTER TABLE \`rate\` DROP FOREIGN KEY \`FK_79be2c9ed993a3e7d725710a094\``);
        await queryRunner.query(`ALTER TABLE \`rate\` DROP FOREIGN KEY \`FK_7440b44c5acbec8b2ebfc3af7d2\``);
        await queryRunner.query(`ALTER TABLE \`feature\` DROP FOREIGN KEY \`FK_8fcbde65f11217e54f2d5be5856\``);
        await queryRunner.query(`ALTER TABLE \`contribution\` DROP FOREIGN KEY \`FK_d2084068d6246a419df6fec9d0f\``);
        await queryRunner.query(`ALTER TABLE \`store_revision\` DROP FOREIGN KEY \`FK_badf975a873ae12be0a7e38d0b4\``);
        await queryRunner.query(`ALTER TABLE \`store_revision\` DROP FOREIGN KEY \`FK_0580f84f046137f1e96d30b5d06\``);
        await queryRunner.query(`ALTER TABLE \`store_revision\` DROP FOREIGN KEY \`FK_aaaff2e4218eccb5f7e4f8e384e\``);
        await queryRunner.query(`ALTER TABLE \`schedule\` DROP FOREIGN KEY \`FK_cf47e0d73277daf5c40be78aee7\``);
        await queryRunner.query(`ALTER TABLE \`store_product\` DROP FOREIGN KEY \`FK_13e275149d7414c2694da12dcf7\``);
        await queryRunner.query(`ALTER TABLE \`store_product\` DROP FOREIGN KEY \`FK_8988ebd2c1c321738c3bfa4c9b4\``);
        await queryRunner.query(`DROP INDEX \`IDX_2af5b31f918a0a3f7e0e15242d\` ON \`rate_recommended_products_store_product\``);
        await queryRunner.query(`DROP INDEX \`IDX_77c33401aa365dc19139573a72\` ON \`rate_recommended_products_store_product\``);
        await queryRunner.query(`DROP TABLE \`rate_recommended_products_store_product\``);
        await queryRunner.query(`DROP INDEX \`IDX_75855ace632fa9313cd34f8b2c\` ON \`user_favorites_store\``);
        await queryRunner.query(`DROP INDEX \`IDX_87caa58559fb3f27fe99043c45\` ON \`user_favorites_store\``);
        await queryRunner.query(`DROP TABLE \`user_favorites_store\``);
        await queryRunner.query(`DROP INDEX \`IDX_0094095d59ef09a9803eabbc89\` ON \`store_features_feature\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b5b9f6c8f2697b9b79126a2f1\` ON \`store_features_feature\``);
        await queryRunner.query(`DROP TABLE \`store_features_feature\``);
        await queryRunner.query(`DROP INDEX \`IDX_181af7d2a9dc0ce81f0a0d1980\` ON \`version\``);
        await queryRunner.query(`DROP TABLE \`version\``);
        await queryRunner.query(`DROP INDEX \`REL_83b6b296f773228213fd4d50e6\` ON \`store_validation\``);
        await queryRunner.query(`DROP TABLE \`store_validation\``);
        await queryRunner.query(`DROP INDEX \`REL_0b9e94fc51e078951f5533647c\` ON \`rate\``);
        await queryRunner.query(`DROP TABLE \`rate\``);
        await queryRunner.query(`DROP INDEX \`IDX_4832be692a2dc63d67e8e93c75\` ON \`feature\``);
        await queryRunner.query(`DROP TABLE \`feature\``);
        await queryRunner.query(`DROP INDEX \`IDX_407dc990403e17d5321783dc7e\` ON \`feature_category\``);
        await queryRunner.query(`DROP TABLE \`feature_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb34d34882bdea531808c47dce\` ON \`currency_rate\``);
        await queryRunner.query(`DROP TABLE \`currency_rate\``);
        await queryRunner.query(`DROP TABLE \`contribution\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_badf975a873ae12be0a7e38d0b\` ON \`store_revision\``);
        await queryRunner.query(`DROP TABLE \`store_revision\``);
        await queryRunner.query(`DROP TABLE \`schedule\``);
        await queryRunner.query(`DROP TABLE \`store_product\``);
        await queryRunner.query(`DROP INDEX \`IDX_22cc43e9a74d7498546e9a63e7\` ON \`product\``);
        await queryRunner.query(`DROP TABLE \`product\``);
        await queryRunner.query(`DROP TABLE \`store\``);
    }
}
