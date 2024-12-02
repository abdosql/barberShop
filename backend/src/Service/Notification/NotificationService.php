<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Notification;

use App\Service\Notification\Contract\NotificationSenderInterface;
use App\Service\Notification\Contract\NotificationServiceInterface;
use App\Service\Notification\DTO\NotificationDetails;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

readonly class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private NotificationSenderInterface $notificationSender
    ) {
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function notify(array $details): void
    {
        try {
            $notificationDetails = NotificationDetails::fromArray($details);
            $this->notificationSender->send($notificationDetails);
        } catch (\Exception $e) {
            // Log the error but don't throw it to prevent breaking the main application flow
            error_log('Notification error: ' . $e->getMessage());
            throw $e;
        }
    }
}