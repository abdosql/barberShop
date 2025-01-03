<?php

namespace App\Notification\Provider;

use App\Notification\Contract\NotificationProviderInterface;
use App\Notification\Exception\WhatsAppApiException;
use App\Notification\Template\WhatsAppTemplateRegistry;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
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
            // Validate template
            if (!isset($options['template'])) {
                throw new \InvalidArgumentException('Template name is required for WhatsApp messages');
            }

            $template = $this->templateRegistry->getTemplate($options['template']);
            if (!$template) {
                throw new \InvalidArgumentException(sprintf('Template "%s" not found', $options['template']));
            }

            // Format message data
            $messageData = $template->format($content);

            // Make API call
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

            // Handle response
            $statusCode = $response->getStatusCode();
            $responseData = $response->toArray(false);

            if ($statusCode !== 200) {
                throw WhatsAppApiException::fromResponse($responseData, $statusCode);
            }

            // Check for specific error conditions in the response
            if (isset($responseData['error'])) {
                throw WhatsAppApiException::fromResponse($responseData, $statusCode);
            }

            return true;

        } catch (HttpExceptionInterface $e) {
            // Handle HTTP exceptions
            $responseData = [];
            try {
                $responseData = json_decode($e->getResponse()->getContent(false), true) ?? [];
            } catch (\Throwable) {
                // Ignore JSON decode errors
            }

            throw new WhatsAppApiException(
                'HTTP error while sending WhatsApp message',
                $responseData,
                $e->getResponse()->getStatusCode(),
                $e
            );
        } catch (WhatsAppApiException $e) {
            // Re-throw WhatsApp API exceptions
            throw $e;
        } catch (\Throwable $e) {
            // Handle all other exceptions
            throw new WhatsAppApiException(
                'Failed to send WhatsApp message: ' . $e->getMessage(),
                [],
                500,
                $e
            );
        }
    }
}
