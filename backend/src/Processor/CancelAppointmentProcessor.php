<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\DTO\Input\CancelAppointment;
use App\Service\Appointment\AppointmentManager;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

readonly class CancelAppointmentProcessor implements ProcessorInterface
{
    public function __construct
    (
        private AppointmentManager $appointmentManager
    )
    {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): void
    {
        if (!$data instanceof CancelAppointment) {
            throw new \RuntimeException('Invalid data provided to the processor expected a CancelAppointmentInput');
        }

        $request = $context['request'] ?? null;
        if (!$request || $request->getMethod() !== 'PATCH') {
            throw new \RuntimeException('Invalid HTTP method for canceling an appointment');
        }

        try {
            $this->appointmentManager->handleCancellation($data->url);
        } catch (AccessDeniedHttpException $e) {
            throw new AccessDeniedHttpException('Access denied: ' . $e->getMessage());
        } catch (EntityNotFoundException $e) {
            throw new NotFoundHttpException('Resource not found: ' . $e->getMessage());
        } catch (BadRequestException $e) {
            throw new BadRequestException('Bad request: ' . $e->getMessage());
        } catch (\Exception $e) {

            error_log(sprintf('Failed to process cancellation: %s', $e->getMessage()));
            throw new \RuntimeException('An unexpected error occurred during cancellation processing.');
        }
    }
}