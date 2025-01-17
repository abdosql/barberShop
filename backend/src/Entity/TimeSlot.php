<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\TimeSlotRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TimeSlotRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['timeslot:read']],
        ),
        new Post(
            denormalizationContext: ['groups' => ['timeslot:create']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Only authorized users can create time slots."
        ),
        new Get(
            normalizationContext: ['groups' => ['timeslot:read']],
        ),
        new Put(
            denormalizationContext: ['groups' => ['timeslot:update']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can update time slots."
        ),
        new Patch(
            denormalizationContext: ['groups' => ['timeslot:patch']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Only admins can update time slots."
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Only admins can delete time slots."
        )
    ],
    normalizationContext: ['groups' => ['timeslot:read']],
    denormalizationContext: ['groups' => ['timeslot:create', 'timeslot:update', 'timeslot:patch']]
)]
class TimeSlot
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['timeslot:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['timeslot:read', 'timeslot:create', 'timeslot:update'])]
    private ?\DateTimeImmutable $startTime = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['timeslot:read', 'timeslot:create', 'timeslot:update'])]
    private ?\DateTimeImmutable $endTime = null;

//    #[ORM\Column(type: Types::BOOLEAN)]
//    #[Groups(['timeslot:read', 'timeslot:patch'])]
//    private ?bool $isAvailable = true;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['timeslot:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['timeslot:read', 'timeslot:update'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[Groups(['timeslot:create'])]
    #[ORM\ManyToOne(inversedBy: 'timeSlots')]
    private ?Appointment $appointment = null;

    /**
     * @var Collection<int, DailyTimeSlot>
     */
    #[Groups(['timeslot:read', 'timeslot:create', 'timeslot:patch', 'appointment:create'])]
    #[ORM\OneToMany(targetEntity: DailyTimeSlot::class, mappedBy: "timeSlot", cascade: ["persist"])]
    private Collection $dailyTimeSlots;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->dailyTimeSlots = new ArrayCollection();
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

//    public function getIsAvailable(): ?bool
//    {
//        return $this->isAvailable;
//    }
//
//    public function setIsAvailable(bool $isAvailable): static
//    {
//        $this->isAvailable = $isAvailable;
//
//        return $this;
//    }

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

    public function getAppointment(): ?Appointment
    {
        return $this->appointment;
    }

    public function setAppointment(?Appointment $appointment): static
    {
        $this->appointment = $appointment;

        return $this;
    }

    /**
     * @return Collection<int, DailyTimeSlot>
     */
    public function getDailyTimeSlots(): Collection
    {
        return $this->dailyTimeSlots;
    }

    public function addDailyTimeSlot(DailyTimeSlot $dailyTimeSlot): static
    {
        if (!$this->dailyTimeSlots->contains($dailyTimeSlot)) {
            $this->dailyTimeSlots->add($dailyTimeSlot);
            $dailyTimeSlot->setTimeSlot($this);
        }

        return $this;
    }

    public function removeDailyTimeSlot(DailyTimeSlot $dailyTimeSlot): static
    {
        if ($this->dailyTimeSlots->removeElement($dailyTimeSlot)) {
            // set the owning side to null (unless already changed)
            if ($dailyTimeSlot->getTimeSlot() === $this) {
                $dailyTimeSlot->setTimeSlot(null);
            }
        }

        return $this;
    }
}
