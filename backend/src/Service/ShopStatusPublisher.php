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
                "shop-status"
            ],
            data: [
                'id' => $status->getId(),
                'isOpen' => $status->getIsOpen(),
                'lastUpdated' => $status->getLastUpdated()->format(\DateTimeInterface::ATOM)
            ]
        );
    }
}
