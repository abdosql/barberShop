<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Processor;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ShopStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class ShopStatusStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PersistProcessor       $persistProcessor,
        private Security $security,
    )
    {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ShopStatus
    {
        $repository = $this->entityManager->getRepository(ShopStatus::class);
        $status = $repository->findOneBy([]);

        if (!$status) {
            throw new NotFoundHttpException('Shop status not found');
        }

        if ($data instanceof ShopStatus) {
            $status->setIsOpen($data->getIsOpen());
            $status->setLastUpdated(new \DateTimeImmutable());

            if ($this->security->getUser()) {
                $status->setUpdatedBy($this->security->getUser());
            }
        }
        
        return $this->persistProcessor->process($status, $operation, $uriVariables, $context);
    }
}