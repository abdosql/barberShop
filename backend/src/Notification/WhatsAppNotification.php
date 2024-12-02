<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification;

use App\Notification\Clients\WhatsAppClient;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class WhatsAppNotification extends AbstractNotification
{
//    private WhatsAppClient $client;
//
//    public function __construct(array $config, WhatsAppClient $client)
//    {
//        parent::__construct($config);
//        $this->client = $client;
//    }
//
//    /**
//     * @throws RedirectionExceptionInterface
//     * @throws DecodingExceptionInterface
//     * @throws ClientExceptionInterface
//     * @throws TransportExceptionInterface
//     * @throws ServerExceptionInterface
//     */
//    public function send(string $recipient, string $content, array $options = []): void
//    {
//        // WhatsApp allows sending either template messages or session messages
//        if (isset($options['template_name'])) {
//            $this->sendTemplateMessage($recipient, $options['template_name'], $options['template_params'] ?? []);
//        } else {
//            $this->sendTextMessage($recipient, $content);
//        }
//    }
//
//    /**
//     * @throws TransportExceptionInterface
//     * @throws ServerExceptionInterface
//     * @throws RedirectionExceptionInterface
//     * @throws DecodingExceptionInterface
//     * @throws ClientExceptionInterface
//     */
//    private function sendTemplateMessage(string $recipient, string $templateName, array $parameters): void
//    {
//        $this->client->sendMessage([
//            'messaging_product' => 'whatsapp',
//            'to' => $this->formatPhoneNumber($recipient),
//            'type' => 'template',
//            'template' => [
//                'name' => $templateName,
//                'language' => [
//                    'code' => $options['language'] ?? 'en'
//                ],
//                'components' => [
//                    [
//                        'type' => 'body',
//                        'parameters' => $parameters
//                    ]
//                ]
//            ]
//        ]);
//    }
//
//    /**
//     * @throws TransportExceptionInterface
//     * @throws ServerExceptionInterface
//     * @throws RedirectionExceptionInterface
//     * @throws DecodingExceptionInterface
//     * @throws ClientExceptionInterface
//     */
//    private function sendTextMessage(string $recipient, string $content): void
//    {
//        $this->client->sendMessage([
//            'messaging_product' => 'whatsapp',
//            'to' => $this->formatPhoneNumber($recipient),
//            'type' => 'text',
//            'text' => [
//                'body' => $content
//            ]
//        ]);
//    }
//
//    private function formatPhoneNumber(string $number): string
//    {
//        return preg_replace('/[^0-9]/', '', $number);
//    }
    public function send(array $details, array $options = []): void
    {
        // TODO: Implement send() method.
    }
}
