<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\DTO\Input\CancelAppointment;
use App\Processor\AppointmentProcessor;
use App\Processor\CancelAppointmentProcessor;
use App\Repository\AppointmentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiFilter(DateFilter::class, properties: ['startTime'])]
#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['appointment:read']],
            security: "is_granted('ROLE_USER') or (request.query.has('startTime') and not request.query.has('extended'))"
        ),
        new Post(
            denormalizationContext: ['groups' => ['appointment:create']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Only admins can create appointments.",
            processor: AppointmentProcessor::class
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
        new Patch(
            denormalizationContext: ['groups' => ['appointment:patch']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can edit appointments.",
            processor: AppointmentProcessor::class
        ),

        new Patch(
            uriTemplate: '/appointment/cancel',
            description: "Cancel appointment",
            denormalizationContext: ['groups' => ['appointment:cancel']],
            input: CancelAppointment::class,
            name: 'appointment_cancel',
            processor: CancelAppointmentProcessor::class
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can delete appointments."
        )

    ],
    normalizationContext: ['groups' => ['appointment:read']],
    denormalizationContext: ['groups' => ['appointment:create', 'appointment:update', 'appointment:patch']]
)]
class Appointment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['appointment:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update', 'appointment:date_filter'])]
    private ?\DateTimeImmutable $startTime = null;

    #[ORM\Column]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update', 'appointment:date_filter'])]
    private ?\DateTimeImmutable $endTime = null;

    #[ORM\Column(length: 255)]
    #[Groups(['appointment:read', 'appointment:create', 'appointment:update', 'appointment:patch', 'appointment:date_filter'])]
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
    #[Groups(['appointment:read', 'appointment:update'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'appointments')]
    #[Groups(['appointment:read'])]
    private ?User $user_ = null;

    /**
     * @var Collection<int, TimeSlot>
     */
    #[Groups(['appointment:read', 'appointment:create'])]
    #[ORM\OneToMany(targetEntity: TimeSlot::class, mappedBy: 'appointment')]
    private Collection $timeSlots;

    /**
     * @var Collection<int, Service>
     */
    #[Groups(['appointment:read', 'appointment:create'])]
    #[ORM\ManyToMany(targetEntity: Service::class, mappedBy: 'appointment')]
    private Collection $services;

    #[ORM\OneToOne(mappedBy: 'appointment', cascade: ['persist', 'remove'])]
    private ?CancellationUrl $cancellationUrl = null;

    public function __construct()
    {
        $this->timeSlots = new ArrayCollection();
        $this->services = new ArrayCollection();
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

    /**
     * @return Collection<int, TimeSlot>
     */
    public function getTimeSlots(): Collection
    {
        return $this->timeSlots;
    }

    public function addTimeSlot(TimeSlot $timeSlot): static
    {
        if (!$this->timeSlots->contains($timeSlot)) {
            $this->timeSlots->add($timeSlot);
            $timeSlot->setAppointment($this);
        }

        return $this;
    }

    public function removeTimeSlot(TimeSlot $timeSlot): static
    {
        if ($this->timeSlots->removeElement($timeSlot)) {
            // set the owning side to null (unless already changed)
            if ($timeSlot->getAppointment() === $this) {
                $timeSlot->setAppointment(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Service>
     */
    public function getServices(): Collection
    {
        return $this->services;
    }

    public function addService(Service $service): static
    {
        if (!$this->services->contains($service)) {
            $this->services->add($service);
            $service->addAppointment($this);
        }

        return $this;
    }

    public function removeService(Service $service): static
    {
        if ($this->services->removeElement($service)) {
            $service->removeAppointment($this);
        }

        return $this;
    }

    public function getCancellationUrl(): ?CancellationUrl
    {
        return $this->cancellationUrl;
    }

    public function setCancellationUrl(?CancellationUrl $cancellationUrl): static
    {
        // unset the owning side of the relation if necessary
        if ($cancellationUrl === null && $this->cancellationUrl !== null) {
            $this->cancellationUrl->setAppointment(null);
        }

        // set the owning side of the relation if necessary
        if ($cancellationUrl !== null && $cancellationUrl->getAppointment() !== $this) {
            $cancellationUrl->setAppointment($this);
        }

        $this->cancellationUrl = $cancellationUrl;

        return $this;
    }
}
