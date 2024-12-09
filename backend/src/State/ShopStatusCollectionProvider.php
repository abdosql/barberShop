<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\ShopStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class ShopStatusCollectionProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $repository = $this->entityManager->getRepository(ShopStatus::class);

        $status = $repository->findOneBy([]) ?? $this->createInitialStatus();
        return [$status];
    }

    public function createInitialStatus(): ShopStatus
    {
        $status = new ShopStatus();
        $status->setIsOpen(true)
            ->setLastUpdated(new \DateTimeImmutable())
        ;
        $this->entityManager->persist($status);
        $this->entityManager->flush();

        return $status;
    }
}