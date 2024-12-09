<?php

namespace App\Service;

use App\Entity\ShopStatus;
use App\Publisher\PublisherInterface;

readonly class ShopStatusPublisher
{
    private string $mercureHost;
    private string $scheme;

    public function __construct(
        private PublisherInterface $publisher,
        string $mercurePublicUrl,
    ) {
        $parsedUrl = parse_url($mercurePublicUrl);
        $this->mercureHost = $parsedUrl['host'] ?? 'localhost';
        $this->scheme = $parsedUrl['scheme'] ?? 'http';
    }

    public function publish(ShopStatus $status): void
    {
        $this->publisher->publish(
            topics: [
                sprintf('%s://%s/shop-status/', $this->scheme, $this->mercureHost),
                sprintf('%s://%s/shop-status/%s', $this->scheme, $this->mercureHost, $status->getId())
            ],
            data: [
                'id' => $status->getId(),
                'isOpen' => $status->getIsOpen(),
                'lastUpdated' => $status->getLastUpdated()->format(\DateTimeInterface::ATOM)
            ]
        );
    }
}
