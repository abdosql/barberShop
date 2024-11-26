<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Factory;

use App\Notification\Clients\TelegramClient;
use App\Notification\Clients\WhatsAppClient;
use App\Notification\NotificationInterface;
use App\Notification\TelegramNotification;
use App\Notification\WhatsAppNotification;
use Symfony\Component\DependencyInjection\ContainerInterface;

class NotificationFactory
{
    private array $config;
    private WhatsAppClient $whatsAppClient;
    private TelegramClient $telegramClient;

    public function __construct(
        array $config,
        WhatsAppClient $whatsAppClient,
        TelegramClient $telegramClient
    ) {
        $this->config = $config;
        $this->whatsAppClient = $whatsAppClient;
        $this->telegramClient = $telegramClient;
    }

    public function create(string $type): NotificationInterface
    {
        return match ($type) {
            'whatsapp' => new WhatsAppNotification(
                $this->config['whatsapp'],
                $this->whatsAppClient
            ),
            'telegram' => new TelegramNotification(
                $this->config['telegram'],
                $this->telegramClient
            ),
            default => throw new \InvalidArgumentException("Unsupported notification type: $type"),
        };
    }
}