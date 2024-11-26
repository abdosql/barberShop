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

class WhatsAppClient
{
    private string $apiKey;
    private string $phoneNumberId;
    private HttpClientInterface $httpClient;
    private string $apiVersion;

    public function __construct(
        string $apiKey,
        string $phoneNumberId,
        HttpClientInterface $httpClient,
        string $apiVersion = 'v21.0'
    ) {
        $this->apiKey = $apiKey;
        $this->phoneNumberId = $phoneNumberId;
        $this->httpClient = $httpClient;
        $this->apiVersion = $apiVersion;
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function sendMessage(array $data): array
    {
        $response = $this->httpClient->request('POST',
            "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages",
            [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]
        );

        return $response->toArray();
    }
}