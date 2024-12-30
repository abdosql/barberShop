<?php

namespace App\Notification;

use App\Notification\Contract\NotificationProviderInterface;
use App\Notification\Exception\NotificationException;

class NotificationFacade
{
    public function __construct(
        private readonly NotificationFactory $notificationFactory
    ) {}

    /**
     * Send a notification using a specific provider
     *
     * @param string $provider Provider name (e.g., 'whatsapp', 'telegram')
     * @param string $recipient Recipient identifier (phone number, chat id, etc.)
     * @param array $content Content of the notification
     * @param array $options Additional options (template name, etc.)
     * 
     * @throws NotificationException
     */
    public function send(string $provider, string $recipient, array $content, array $options = []): bool
    {
        $notificationProvider = $this->notificationFactory->getProvider($provider);
        
        if (!$notificationProvider) {
            throw new NotificationException(sprintf('Provider "%s" not found', $provider));
        }

        return $notificationProvider->send($recipient, $content, $options);
    }

    /**
     * Send a WhatsApp notification using a template
     *
     * @param string $recipient WhatsApp phone number
     * @param string $templateName Template name
     * @param array $params Template parameters
     * @param string|null $appointmentId Optional appointment ID for cancel URL
     */
    public function sendWhatsAppTemplate(
        string $recipient,
        string $templateName,
        array $params,
        ?string $appointmentId = null
    ): bool {
        $content = [
            'recipient_id' => $recipient,
            'param1' => $params[0] ?? '',
            'param2' => $params[1] ?? '',
            'param3' => $params[2] ?? '',
            'param4' => $params[3] ?? '',
        ];

        if ($appointmentId) {
            $content['appointment_id'] = $appointmentId;
        }

        return $this->send('whatsapp', $recipient, $content, ['template' => $templateName]);
    }

    /**
     * Get all available notification providers
     *
     * @return array<string, NotificationProviderInterface>
     */
    public function getAvailableProviders(): array
    {
        return $this->notificationFactory->getProviders();
    }
}
