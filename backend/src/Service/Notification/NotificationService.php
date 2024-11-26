<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Notification;

use App\Factory\NotificationFactory;

class NotificationService
{
    private NotificationFactory $factory;
    private string $defaultChannel;

    public function __construct(NotificationFactory $factory, string $defaultChannel = 'whatsapp')
    {
        $this->factory = $factory;
        $this->defaultChannel = $defaultChannel;
    }

    public function notify(string $recipient, string $message, ?string $channel = null): void
    {
        $notification = $this->factory->create($channel ?? $this->defaultChannel);
        $notification->send($recipient, $message);
    }
}