<?php

namespace App\Entity;

use App\Repository\DailyTimeSlotRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DailyTimeSlotRepository::class)]
class DailyTimeSlot
{
    #[Groups(['timeslot:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['timeslot:read', 'timeslot:create',])]
    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    #[Groups(['timeslot:read', 'timeslot:create', 'timeslot:patch'])]
    #[ORM\Column]
    private ?bool $is_available = null;

    #[ORM\ManyToOne(inversedBy: 'dailyTimeSlots')]
    #[Groups(['timeslot:read', 'timeslot:create'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?TimeSlot $timeSlot = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function isAvailable(): ?bool
    {
        return $this->is_available;
    }

    public function setIsAvailable(bool $is_available): static
    {
        $this->is_available = $is_available;

        return $this;
    }

    public function getTimeSlot(): ?TimeSlot
    {
        return $this->timeSlot;
    }

    public function setTimeSlot(?TimeSlot $timeSlot): static
    {
        $this->timeSlot = $timeSlot;

        return $this;
    }
}
