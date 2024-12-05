<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241205183604 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE appointment (id SERIAL NOT NULL, user__id INT DEFAULT NULL, start_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, end_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status VARCHAR(255) NOT NULL, total_duration INT NOT NULL, total_price NUMERIC(10, 2) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_FE38F8448D57A4BB ON appointment (user__id)');
        $this->addSql('COMMENT ON COLUMN appointment.start_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN appointment.end_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN appointment.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN appointment.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE appointment_service (id SERIAL NOT NULL, appointment_id INT NOT NULL, service_id INT NOT NULL, quantity INT NOT NULL, price NUMERIC(10, 2) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_70BEA8FAE5B533F9 ON appointment_service (appointment_id)');
        $this->addSql('CREATE INDEX IDX_70BEA8FAED5CA9E6 ON appointment_service (service_id)');
        $this->addSql('CREATE TABLE daily_time_slot (id SERIAL NOT NULL, time_slot_id INT NOT NULL, date DATE NOT NULL, is_available BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_80B73050D62B0FA ON daily_time_slot (time_slot_id)');
        $this->addSql('CREATE TABLE notification (id SERIAL NOT NULL, user__id INT DEFAULT NULL, type VARCHAR(255) NOT NULL, message VARCHAR(255) NOT NULL, is_read BOOLEAN NOT NULL, sent_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BF5476CA8D57A4BB ON notification (user__id)');
        $this->addSql('COMMENT ON COLUMN notification.sent_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN notification.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE service (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, price NUMERIC(10, 0) NOT NULL, description VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, duration INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN service.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN service.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE time_slot (id SERIAL NOT NULL, appointment_id INT DEFAULT NULL, start_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, end_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1B3294AE5B533F9 ON time_slot (appointment_id)');
        $this->addSql('COMMENT ON COLUMN time_slot.start_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN time_slot.end_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN time_slot.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN time_slot.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, phone_number VARCHAR(20) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, roles JSON NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN "user".updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_FE38F8448D57A4BB FOREIGN KEY (user__id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointment_service ADD CONSTRAINT FK_70BEA8FAE5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointment_service ADD CONSTRAINT FK_70BEA8FAED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE daily_time_slot ADD CONSTRAINT FK_80B73050D62B0FA FOREIGN KEY (time_slot_id) REFERENCES time_slot (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CA8D57A4BB FOREIGN KEY (user__id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE time_slot ADD CONSTRAINT FK_1B3294AE5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE appointment DROP CONSTRAINT FK_FE38F8448D57A4BB');
        $this->addSql('ALTER TABLE appointment_service DROP CONSTRAINT FK_70BEA8FAE5B533F9');
        $this->addSql('ALTER TABLE appointment_service DROP CONSTRAINT FK_70BEA8FAED5CA9E6');
        $this->addSql('ALTER TABLE daily_time_slot DROP CONSTRAINT FK_80B73050D62B0FA');
        $this->addSql('ALTER TABLE notification DROP CONSTRAINT FK_BF5476CA8D57A4BB');
        $this->addSql('ALTER TABLE time_slot DROP CONSTRAINT FK_1B3294AE5B533F9');
        $this->addSql('DROP TABLE appointment');
        $this->addSql('DROP TABLE appointment_service');
        $this->addSql('DROP TABLE daily_time_slot');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE time_slot');
        $this->addSql('DROP TABLE "user"');
    }
}
