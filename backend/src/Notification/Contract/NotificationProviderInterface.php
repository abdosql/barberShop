<?php

namespace App\Notification\Contract;

interface NotificationProviderInterface
{
    /**
     * Send a notification using the provider
     *
     * @param string $recipient The recipient of the notification
     * @param array $content The content of the notification
     * @param array $options Additional options for the notification
     * @return bool Whether the notification was sent successfully
     */
    public function send(string $recipient, array $content, array $options = []): bool;
}
