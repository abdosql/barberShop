<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\AppointmentServiceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AppointmentServiceRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['appointmentService:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            denormalizationContext: ['groups' => ['appointmentService:create']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Only users with the correct role can create appointment services."
        ),
        new Get(
            normalizationContext: ['groups' => ['appointmentService:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['appointmentService:update']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can edit appointment services."
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can delete appointment services."
        )
    ],
    normalizationContext: ['groups' => ['appointmentService:read']],
    denormalizationContext: ['groups' => ['appointmentService:create', 'appointmentService:update']]
)]
class AppointmentService
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['appointmentService:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['appointmentService:read', 'appointmentService:create', 'appointmentService:update'])]
    private ?int $quantity = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['appointmentService:read', 'appointmentService:create', 'appointmentService:update'])]
    private ?string $price = null;

    #[ORM\ManyToOne(inversedBy: 'appointmentServices')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointmentService:read', 'appointmentService:create', 'appointmentService:update'])]
    private ?Appointment $appointment = null;

    #[ORM\ManyToOne(inversedBy: 'appointmentServices')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointmentService:read', 'appointmentService:create', 'appointmentService:update'])]
    private ?Service $Service = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

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

    public function getAppointment(): ?Appointment
    {
        return $this->appointment;
    }

    public function setAppointment(?Appointment $appointment): static
    {
        $this->appointment = $appointment;

        return $this;
    }

    public function getService(): ?Service
    {
        return $this->Service;
    }

    public function setService(?Service $Service): static
    {
        $this->Service = $Service;

        return $this;
    }
}
