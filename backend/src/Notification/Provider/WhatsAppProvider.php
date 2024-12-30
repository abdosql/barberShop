<?php

namespace App\Notification\Provider;

use App\Notification\Contract\NotificationProviderInterface;
use App\Notification\Template\WhatsAppTemplateRegistry;
use Symfony\Contracts\HttpClient\HttpClientInterface;

readonly class WhatsAppProvider implements NotificationProviderInterface
{
    private const API_VERSION = 'v21.0';
    private string $apiKey;
    private string $phoneNumberId;

    public function __construct(
        private HttpClientInterface $httpClient,
        private WhatsAppTemplateRegistry $templateRegistry,
        private string $baseUrl = 'https://graph.facebook.com'
    ) {
        $this->apiKey = $_ENV['WHATSAPP_API_KEY'] ?? throw new \RuntimeException('WHATSAPP_API_KEY is not set in environment');
        $this->phoneNumberId = $_ENV['WHATSAPP_PHONE_NUMBER_ID'] ?? throw new \RuntimeException('WHATSAPP_PHONE_NUMBER_ID is not set in environment');
    }

    public function send(string $recipient, array $content, array $options = []): bool
    {
        try {
            // Get template if specified
            if (!isset($options['template'])) {
                throw new \InvalidArgumentException('Template name is required for WhatsApp messages');
            }

            $template = $this->templateRegistry->getTemplate($options['template']);
            if (!$template) {
                throw new \InvalidArgumentException(sprintf('Template "%s" not found', $options['template']));
            }

            $messageData = $template->format($content);

            // Make API call to WhatsApp
            $response = $this->httpClient->request(
                'POST',
                sprintf('%s/%s/%s/messages', $this->baseUrl, self::API_VERSION, $this->phoneNumberId),
                [
                    'headers' => [
                        'Authorization' => sprintf('Bearer %s', $this->apiKey),
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $messageData,
                ]
            );
            return $response->getStatusCode() === 200;
        } catch (\Throwable $e) {
            // Log the error here
            return false;
        }
    }
}
