<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['service:read']],
         ),
        new Post(
            denormalizationContext: ['groups' => ['service:create']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can create services."
        ),
        new Get(
            normalizationContext: ['groups' => ['service:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['service:update']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can edit services."
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can delete services."
        )
    ],
    normalizationContext: ['groups' => ['service:read']],
    denormalizationContext: ['groups' => ['service:create', 'service:update']]
)]
#[ORM\Entity(repositoryClass: ServiceRepository::class)]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['service:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['service:read', 'service:create', 'service:update', 'appointment:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 0)]
    #[Groups(['service:read', 'service:create', 'service:update'])]
    private ?string $price = null;

    #[ORM\Column(length: 255)]
    #[Groups(['service:read', 'service:create', 'service:update'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['service:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['service:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column]
    #[Groups(['service:read', 'service:create', 'service:update'])]
    private ?int $duration = null;

    /**
     * @var Collection<int, Appointment>
     */
    #[ORM\ManyToMany(targetEntity: Appointment::class, inversedBy: 'services')]
    private Collection $appointment;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->appointment = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    /**
     * @return Collection<int, Appointment>
     */
    public function getAppointment(): Collection
    {
        return $this->appointment;
    }

    public function addAppointment(Appointment $appointment): static
    {
        if (!$this->appointment->contains($appointment)) {
            $this->appointment->add($appointment);
        }

        return $this;
    }

    public function removeAppointment(Appointment $appointment): static
    {
        $this->appointment->removeElement($appointment);

        return $this;
    }
}
