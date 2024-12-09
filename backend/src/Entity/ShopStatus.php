<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\Processor\ShopStatusStateProcessor;
use App\Repository\ShopStatusRepository;
use App\State\ShopStatusCollectionProvider;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/shop/status',
            normalizationContext: ['groups' => ['shop_status:read']],
            security: 'is_granted("PUBLIC_ACCESS")',
            provider: ShopStatusCollectionProvider::class
        ),
        new Patch(
            uriTemplate: '/shop/status/{id}',
            normalizationContext: ['groups' => ['shop_status:read']],
            denormalizationContext: ['groups' => ['shop_status:patch']],
//            security: 'is_granted("ROLE_ADMIN")',
            processor: ShopStatusStateProcessor::class
        )
    ]
)]
#[ORM\Entity(repositoryClass: ShopStatusRepository::class)]
class ShopStatus
{
    #[Groups(["shop_status:read"])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(["shop_status:read", "shop_status:patch"])]
    #[ORM\Column]
    private ?bool $isOpen = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $lastUpdated = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    private ?User $updatedBy = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIsOpen(): ?bool
    {
        return $this->isOpen;
    }

    public function setIsOpen(bool $isOpen): static
    {
        $this->isOpen = $isOpen;

        return $this;
    }

    public function getLastUpdated(): ?\DateTimeInterface
    {
        return $this->lastUpdated;
    }

    public function setLastUpdated(\DateTimeInterface $lastUpdated): static
    {
        $this->lastUpdated = $lastUpdated;

        return $this;
    }

    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    public function setUpdatedBy(?User $updatedBy): static
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }
}
