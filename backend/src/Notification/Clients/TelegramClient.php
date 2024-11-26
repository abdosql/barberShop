<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification\Clients;

use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TelegramClient
{
    private string $botToken;
    private HttpClientInterface $httpClient;

    public function __construct(string $botToken, HttpClientInterface $httpClient)
    {
        $this->botToken = $botToken;
        $this->httpClient = $httpClient;
    }

    /**
     * Send a text message to a Telegram chat
     *
     * @param string $chatId The chat ID to send the message to
     * @param string $text The message text
     * @param array $options Additional options (keyboard, parse_mode, etc)
     * @return array Response from Telegram API
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function sendTextMessage(string $chatId, string $text, array $options = []): array
    {
        $params = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML'
        ], $options);

        return $this->sendMessage($params);
    }

    /**
     * Send a message with buttons
     *
     * @param string $chatId
     * @param string $text
     * @param array $buttons
     * @return array
     * @throws ClientExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function sendMessageWithButtons(string $chatId, string $text, array $buttons): array
    {
        return $this->sendTextMessage($chatId, $text, [
            'reply_markup' => [
                'inline_keyboard' => $buttons
            ]
        ]);
    }

    /**
     * Base method to send any type of message
     *
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function sendMessage(array $params): array
    {
        $response = $this->httpClient->request('POST',
            "https://api.telegram.org/bot{$this->botToken}/sendMessage",
            [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => $params,
            ]
        );

        return $response->toArray();
    }
}