<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250111231438 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cancellation_url (id SERIAL NOT NULL, appointment_id INT DEFAULT NULL, token VARCHAR(255) NOT NULL, expiration TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, used BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_E8B98F5BE5B533F9 ON cancellation_url (appointment_id)');
        $this->addSql('ALTER TABLE cancellation_url ADD CONSTRAINT FK_E8B98F5BE5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cancellation_url DROP CONSTRAINT FK_E8B98F5BE5B533F9');
        $this->addSql('DROP TABLE cancellation_url');
    }
}
