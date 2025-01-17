<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\AppointmentRepository;
use DateTimeImmutable;

class AppointmentTodayProvider implements ProviderInterface
{
    public function __construct(
        private AppointmentRepository $appointmentRepository
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $today = new DateTimeImmutable('today');
        $tomorrow = new DateTimeImmutable('tomorrow');

        return $this->appointmentRepository->createQueryBuilder('a')
            ->andWhere('a.startTime >= :today')
            ->andWhere('a.startTime < :tomorrow')
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->orderBy('a.startTime', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 