<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification\Clients;

use App\Service\Notification\Contract\NotificationSenderInterface;
use App\Service\Notification\DTO\NotificationDetails;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TelegramClient implements NotificationSenderInterface
{
    private const NOTIFICATION_ENDPOINT = 'http://notification:5000/send_appointment_confirmation';

    public function __construct(
        private readonly HttpClientInterface $httpClient
    ) {
    }

    /**
     * Send appointment confirmation message
     *
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function send(NotificationDetails $details): array
    {
        $response = $this->httpClient->request('POST', self::NOTIFICATION_ENDPOINT, [
            'json' => $details->toArray(),
        ]);

        return $response->toArray();
    }
}