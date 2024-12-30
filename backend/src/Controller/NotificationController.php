<?php

namespace App\Controller;

use App\Notification\NotificationFacade;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class NotificationController extends AbstractController
{
    public function __construct(
        private readonly NotificationFacade $notificationFacade
    ) {}

    #[Route('/notification/test/hello', name: 'notification_test_hello', methods: ['POST'])]
    public function testHelloWorld(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $phoneNumber = $data['phone_number'] ?? '212601498690';
            
            // Remove any '+' prefix and leading '0'
            $phoneNumber = ltrim($phoneNumber, '+0');
            
            // Ensure it starts with '212'
            if (!str_starts_with($phoneNumber, '212')) {
                $phoneNumber = '212' . $phoneNumber;
            }

            $success = $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                ['recipient_id' => $phoneNumber],
                ['template' => 'hello_world']
            );

            if (!$success) {
                throw new \RuntimeException('Failed to send notification');
            }

            return $this->json([
                'status' => 'success',
                'message' => 'Hello world notification sent successfully',
                'details' => [
                    'phone_number' => $phoneNumber
                ]
            ]);
        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/notification/test/appointment', name: 'notification_test_appointment', methods: ['POST'])]
    public function testAppointment(Request $request): JsonResponse
    {
        try {
            // Get data from request
            $data = json_decode($request->getContent(), true);
            
            // Send confirmation
            $success = $this->notificationFacade->send(
                'whatsapp',
                $data['phone_number'] ?? '212601498690',
                [
                    'recipient_id' => $data['phone_number'] ?? '212601498690',
                    'param1' => $data['customer_name'] ?? 'John Doe',
                    'param2' => $data['date'] ?? '2024-01-01',
                    'param3' => $data['time'] ?? '14:00',
                    'param4' => $data['additional_info'] ?? 'Your appointment has been confirmed'
                ],
                ['template' => 'appointment_confirmation']
            );

            if (!$success) {
                throw new \RuntimeException('Failed to send notification');
            }

            return $this->json([
                'status' => 'success',
                'message' => 'Test notification sent successfully'
            ]);
        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
