<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Processor;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Appointment;
use App\Service\Appointment\AppointmentManager;
use App\Service\Appointment\TimeSlotManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

readonly class AppointmentProcessor implements ProcessorInterface
{
    public function __construct(
        private AppointmentManager $appointmentManager,
        private TimeSlotManager $timeSlotManager,
        private PersistProcessor $persistProcessor,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof Appointment) {
            throw new \InvalidArgumentException('Data is not an instance of Appointment');
        }
        $request = $context['request'] ?? null;

        $requestMethod = $request->getMethod();

        $appointment = $this->appointmentManager->handleAppointment($data, $requestMethod);
        $persistedAppointment  = $this->persistProcessor->process($appointment, $operation, $uriVariables, $context);

        $this->timeSlotManager->handleTimeSlots($persistedAppointment, $requestMethod);

        return $persistedAppointment;
    }
}