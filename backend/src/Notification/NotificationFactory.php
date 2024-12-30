<?php

namespace App\Notification;

use App\Notification\Contract\NotificationProviderInterface;
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;

class NotificationFactory
{
    /** @var array<string, NotificationProviderInterface> */
    private array $providers = [];

    /**
     * @param iterable<NotificationProviderInterface> $providers
     */
    public function __construct(
        #[TaggedIterator('app.notification_provider')] iterable $providers
    ) {
        foreach ($providers as $provider) {
            // Get the provider name from the class name
            $className = get_class($provider);
            $providerName = strtolower(substr($className, strrpos($className, '\\') + 1));
            $providerName = str_replace('provider', '', $providerName);
            
            $this->providers[$providerName] = $provider;
        }
    }

    public function getProvider(string $name): ?NotificationProviderInterface
    {
        return $this->providers[$name] ?? null;
    }

    /**
     * @return array<string, NotificationProviderInterface>
     */
    public function getProviders(): array
    {
        return $this->providers;
    }
}
