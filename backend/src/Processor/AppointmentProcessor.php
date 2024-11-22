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
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

readonly class AppointmentProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security               $security,
        private PersistProcessor $persistProcessor,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof Appointment) {
            throw new \InvalidArgumentException('Data is not an instance of Appointment');
        }

        $data->setUser($this->security->getUser());

        $now = new \DateTimeImmutable();
        $data->setCreatedAt($now);
        $data->setUpdatedAt($now);

        $appointment = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        foreach ($appointment->getTimeSlots() as $timeSlot) {
            $timeSlot->setIsAvailable(false);
            $this->entityManager->persist($timeSlot);
        }

        $this->entityManager->flush();

        return $appointment;
    }
}