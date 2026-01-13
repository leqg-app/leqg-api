/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class RatePhoto1768339351829 {
    name = 'RatePhoto1768339351829'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_product_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_product_category_name\` ON \`product_category\``);
        await queryRunner.query(`ALTER TABLE \`photo\` ADD \`rateId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD UNIQUE INDEX \`IDX_96152d453aaea425b5afde3ae9\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_618194d24a7ea86a165d7ec628e\` FOREIGN KEY (\`productCategoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`photo\` ADD CONSTRAINT \`FK_98a06999e861a1de2ab8fd3cf8a\` FOREIGN KEY (\`rateId\`) REFERENCES \`rate\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`photo\` DROP FOREIGN KEY \`FK_98a06999e861a1de2ab8fd3cf8a\``);
        await queryRunner.query(`ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_618194d24a7ea86a165d7ec628e\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP INDEX \`IDX_96152d453aaea425b5afde3ae9\``);
        await queryRunner.query(`ALTER TABLE \`photo\` DROP COLUMN \`rateId\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_product_category_name\` ON \`product_category\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`product\` ADD CONSTRAINT \`FK_product_category\` FOREIGN KEY (\`productCategoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
