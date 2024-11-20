<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\AppointmentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['appointment:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            denormalizationContext: ['groups' => ['appointment:create']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Only admins can create appointments."
        ),
        new Get(
            normalizationContext: ['groups' => ['appointment:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['appointment:update']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can edit appointments."
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can delete appointments."
        )
    ],
    normalizationContext: ['groups' => ['appointment:read']],
    denormalizationContext: ['groups' => ['appointment:create', 'appointment:update']]
)]
class Appointment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['appointment:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?\DateTimeImmutable $startTime = null;

    #[ORM\Column]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?\DateTimeImmutable $endTime = null;

    #[ORM\Column(length: 255)]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?string $status = null;

    #[ORM\Column]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?int $totalDuration = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?string $totalPrice = null;

    #[ORM\Column]
    #[Groups(['appointment:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['appointment:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'appointments')]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?User $user_ = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update'])]
    private ?TimeSlot $timeSlot = null;

    /**
     * @var Collection<int, AppointmentService>
     */
    #[ORM\OneToMany(targetEntity: AppointmentService::class, mappedBy: 'appointment')]
    #[Groups(['appointment:read'])]
    private Collection $appointmentServices;

    public function __construct()
    {
        $this->appointmentServices = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartTime(): ?\DateTimeImmutable
    {
        return $this->startTime;
    }

    public function setStartTime(\DateTimeImmutable $startTime): static
    {
        $this->startTime = $startTime;

        return $this;
    }

    public function getEndTime(): ?\DateTimeImmutable
    {
        return $this->endTime;
    }

    public function setEndTime(\DateTimeImmutable $endTime): static
    {
        $this->endTime = $endTime;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getTotalDuration(): ?int
    {
        return $this->totalDuration;
    }

    public function setTotalDuration(int $totalDuration): static
    {
        $this->totalDuration = $totalDuration;

        return $this;
    }

    public function getTotalPrice(): ?string
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(string $totalPrice): static
    {
        $this->totalPrice = $totalPrice;

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

    public function getUser(): ?User
    {
        return $this->user_;
    }

    public function setUser(?User $user_): static
    {
        $this->user_ = $user_;

        return $this;
    }

    public function getTimeSlot(): ?TimeSlot
    {
        return $this->timeSlot;
    }

    public function setTimeSlot(TimeSlot $timeSlot): static
    {
        $this->timeSlot = $timeSlot;

        return $this;
    }

    /**
     * @return Collection<int, AppointmentService>
     */
    public function getAppointmentServices(): Collection
    {
        return $this->appointmentServices;
    }

    public function addAppointmentService(AppointmentService $appointmentService): static
    {
        if (!$this->appointmentServices->contains($appointmentService)) {
            $this->appointmentServices->add($appointmentService);
            $appointmentService->setAppointment($this);
        }

        return $this;
    }

    public function removeAppointmentService(AppointmentService $appointmentService): static
    {
        if ($this->appointmentServices->removeElement($appointmentService)) {
            // set the owning side to null (unless already changed)
            if ($appointmentService->getAppointment() === $this) {
                $appointmentService->setAppointment(null);
            }
        }

        return $this;
    }
}
