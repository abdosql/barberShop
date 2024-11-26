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

class TelegramNotification extends AbstractNotification
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
    public function send(string $recipient, string $content, array $options = []): void
    {
        $params = [
            'chat_id' => $recipient,
            'text' => $content,
            'parse_mode' => $options['parse_mode'] ?? 'HTML'
        ];

        if (isset($options['reply_markup'])) {
            $params['reply_markup'] = $options['reply_markup'];
        }

        $this->client->sendMessage($params);
    }
}