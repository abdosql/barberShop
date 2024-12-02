<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use Doctrine\ORM\EntityManagerInterface;

readonly class TimeSlotManager
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function handleTimeSlots(Appointment $appointment, ?string $status): void
    {
        foreach ($appointment->getTimeSlots() as $timeSlot) {
            $isAvailable = $status === 'declined';
            $timeSlot->setIsAvailable($isAvailable);
            $this->entityManager->persist($timeSlot);
        }
    }
}