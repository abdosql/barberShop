<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241120234925 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE appointment DROP CONSTRAINT fk_fe38f844d62b0fa');
        $this->addSql('DROP INDEX uniq_fe38f844d62b0fa');
        $this->addSql('ALTER TABLE appointment DROP time_slot_id');
        $this->addSql('ALTER TABLE time_slot ADD appointment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE time_slot ADD CONSTRAINT FK_1B3294AE5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1B3294AE5B533F9 ON time_slot (appointment_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE time_slot DROP CONSTRAINT FK_1B3294AE5B533F9');
        $this->addSql('DROP INDEX IDX_1B3294AE5B533F9');
        $this->addSql('ALTER TABLE time_slot DROP appointment_id');
        $this->addSql('ALTER TABLE appointment ADD time_slot_id INT NOT NULL');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT fk_fe38f844d62b0fa FOREIGN KEY (time_slot_id) REFERENCES time_slot (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_fe38f844d62b0fa ON appointment (time_slot_id)');
    }
}
