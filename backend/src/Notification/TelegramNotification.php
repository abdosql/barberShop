<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification;

use App\Notification\Clients\TelegramClient;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class TelegramNotification extends AbstractNotification implements NotificationInterface
{
    private TelegramClient $client;

    public function __construct(array $config, TelegramClient $client)
    {
        parent::__construct($config);
        $this->client = $client;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function send(array $details, array $options = []): void
    {
        $payload = [
            'phone_number' => $details['phone_number'] ?? '',
            'customer_name' => $details['customer_name'] ?? '',
            'service' => $details['service'] ?? '',
            'date_time' => $details['date_time'] ?? '',
            'barber_name' => $details['barber_name'] ?? '',
            'language' => $details['language'] ?? 'fr'
        ];

        $this->client->sendMessage($payload);
    }

}