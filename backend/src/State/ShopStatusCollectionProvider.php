<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\ShopStatus;
use App\Service\ShopStatusPublisher;
use Doctrine\ORM\EntityManagerInterface;

readonly class ShopStatusCollectionProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ShopStatusPublisher $statusPublisher,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $repository = $this->entityManager->getRepository(ShopStatus::class);
        $status = $repository->findOneBy([]) ?? $this->createInitialStatus();
        
        // Publish current status
        $this->statusPublisher->publish($status);
        
        return [$status];
    }

    public function createInitialStatus(): ShopStatus
    {
        $status = new ShopStatus();
        $status->setIsOpen(true)
            ->setLastUpdated(new \DateTimeImmutable());

        $this->entityManager->persist($status);
        $this->entityManager->flush();

        $this->statusPublisher->publish($status);
        
        return $status;
    }
}