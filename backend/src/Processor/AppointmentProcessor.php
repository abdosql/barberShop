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
use App\Service\Publisher\AppointmentPublisher;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

readonly class AppointmentProcessor implements ProcessorInterface
{
    public function __construct(
        private AppointmentManager $appointmentManager,
        private PersistProcessor $persistProcessor,
        private AppointmentPublisher $appointmentPublisher,
    ) {}

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Appointment) {
            throw new \InvalidArgumentException('Data is not an instance of Appointment');
        }

        $request = $context['request'] ?? null;
        $appointment = $this->appointmentManager->handleAppointment($data, $request->getMethod());

        // Persist the appointment first
        $persistedAppointment = $this->persistProcessor->process($appointment, $operation, $uriVariables, $context);

        // Now publish after we have the ID
        $method = $request->getMethod();
        $action = match($method) {
            'POST' => 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default => 'updated'
        };
        
        $this->appointmentPublisher->publish($persistedAppointment, $action);

        return $persistedAppointment;
    }
}