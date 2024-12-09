<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Publisher;

interface PublisherInterface
{
    public function publish(string|array $topics, mixed $data): void;
}