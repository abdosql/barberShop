<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Analytic\AnalyticsServiceInterface;
use App\DTO\DashboardDTO;

readonly class AnalyticsProvider implements ProviderInterface
{
    public function __construct(
        private AnalyticsServiceInterface $analyticsService
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): DashboardDTO
    {
        return $this->analyticsService->getDashboardMetrics();
    }
}
