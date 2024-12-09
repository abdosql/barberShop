<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\ShopStatus;
use App\Publisher\PublisherInterface;
use Doctrine\ORM\EntityManagerInterface;

readonly class ShopStatusCollectionProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PublisherInterface $publisher
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $repository = $this->entityManager->getRepository(ShopStatus::class);
        $status = $repository->findOneBy([]) ?? $this->createInitialStatus();
        
        // Publish current status
        $this->publishStatus($status);
        
        return [$status];
    }

    public function createInitialStatus(): ShopStatus
    {
        $status = new ShopStatus();
        $status->setIsOpen(true)
            ->setLastUpdated(new \DateTimeImmutable());

        $this->entityManager->persist($status);
        $this->entityManager->flush();

        $this->publishStatus($status);
        
        return $status;
    }

    private function publishStatus(ShopStatus $status): void
    {
        $this->publisher->publish(
            topics: [
                'https://localhost/shop-status/',
                'https://localhost/shop-status/' . $status->getId()
            ],
            data: [
                'id' => $status->getId(),
                'isOpen' => $status->getIsOpen(),
                'lastUpdated' => $status->getLastUpdated()->format(\DateTimeInterface::ATOM)
            ]
        );
    }
}