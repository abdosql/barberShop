<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification;

interface NotificationInterface
{
    public function send(string $recipient, string $content, array $options = []): void;
}