<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241220172937 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE appointment_service_id_seq CASCADE');
        $this->addSql('CREATE TABLE service_appointment (service_id INT NOT NULL, appointment_id INT NOT NULL, PRIMARY KEY(service_id, appointment_id))');
        $this->addSql('CREATE INDEX IDX_32A2DEE8ED5CA9E6 ON service_appointment (service_id)');
        $this->addSql('CREATE INDEX IDX_32A2DEE8E5B533F9 ON service_appointment (appointment_id)');
        $this->addSql('ALTER TABLE service_appointment ADD CONSTRAINT FK_32A2DEE8ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE service_appointment ADD CONSTRAINT FK_32A2DEE8E5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointment_service DROP CONSTRAINT fk_70bea8fae5b533f9');
        $this->addSql('ALTER TABLE appointment_service DROP CONSTRAINT fk_70bea8faed5ca9e6');
        $this->addSql('DROP TABLE appointment_service');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('CREATE SEQUENCE appointment_service_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE appointment_service (id SERIAL NOT NULL, appointment_id INT NOT NULL, service_id INT NOT NULL, quantity INT NOT NULL, price NUMERIC(10, 2) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_70bea8faed5ca9e6 ON appointment_service (service_id)');
        $this->addSql('CREATE INDEX idx_70bea8fae5b533f9 ON appointment_service (appointment_id)');
        $this->addSql('ALTER TABLE appointment_service ADD CONSTRAINT fk_70bea8fae5b533f9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE appointment_service ADD CONSTRAINT fk_70bea8faed5ca9e6 FOREIGN KEY (service_id) REFERENCES service (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE service_appointment DROP CONSTRAINT FK_32A2DEE8ED5CA9E6');
        $this->addSql('ALTER TABLE service_appointment DROP CONSTRAINT FK_32A2DEE8E5B533F9');
        $this->addSql('DROP TABLE service_appointment');
    }
}
