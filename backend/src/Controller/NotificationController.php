<?php

namespace App\Controller;

use App\Notification\NotificationFacade;
use App\Notification\Template\AppointmentReminderTemplate;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Notification\Exception\WhatsAppApiException;
use App\Notification\Template\AppointmentCanceled;
use App\Notification\Template\AppointmentDeclinedTemplate;
use App\Notification\Template\VerificationCodeTemplate;

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
            
            // Format phone number
            $phoneNumber = $data['phone_number'] ?? '212601498690';
            $phoneNumber = ltrim($phoneNumber, '+0');
            if (!str_starts_with($phoneNumber, '212')) {
                $phoneNumber = '212' . $phoneNumber;
            }

            // Create template instance with location data
            $template = new AppointmentReminderTemplate(
                $data['latitude'] ?? 33.5731104,
                $data['longitude'] ?? -7.589843,
                $data['location_name'] ?? 'Barbershop Jalal',
                $data['address'] ?? 'Rue 41, Hay El Fath, Casablanca'
            );

            // Send confirmation using the formatted message
            $success = $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $data['customer_name'] ?? 'John Doe',
                    'param2' => $data['date'] ?? '2024-01-01',
                    'param3' => $data['time'] ?? '14:00',
                    'param4' => $data['additional_info'] ?? 'Your appointment has been confirmed',
                    'appointment_id' => $data['appointment_id'] ?? 'https://example.com/cancel'
                ],
                ['template' => $template->getName()]
            );

            return $this->json([
                'status' => 'success',
                'message' => 'Appointment notification sent successfully',
                'details' => [
                    'phone_number' => $phoneNumber,
                    'template' => $template->getName(),
                    'location' => [
                        'name' => $template->getLocationName(),
                        'address' => $template->getAddress()
                    ]
                ]
            ]);

        } catch (WhatsAppApiException $e) {
            // Handle WhatsApp API specific errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'details' => [
                    'status_code' => $e->getStatusCode(),
                    'api_response' => $e->getApiResponse()
                ]
            ], Response::HTTP_BAD_GATEWAY);
        } catch (\InvalidArgumentException $e) {
            // Handle validation errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            // Handle all other errors
            return $this->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while sending the notification',
                'details' => [
                    'error' => $e->getMessage()
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/notification/test/cancellation', name: 'notification_test_cancellation', methods: ['POST'])]
    public function testCancellation(Request $request): JsonResponse
    {
        try {
            // Get data from request
            $data = json_decode($request->getContent(), true);
            
            // Format phone number
            $phoneNumber = $data['phone_number'] ?? '212601498690';
            $phoneNumber = ltrim($phoneNumber, '+0');
            if (!str_starts_with($phoneNumber, '212')) {
                $phoneNumber = '212' . $phoneNumber;
            }

            // Send cancellation notification
            $success = $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $data['customer_name'] ?? 'John Doe',
                    'param2' => $data['date'] ?? '2024-01-01',
                    'param3' => $data['time'] ?? '14:00',
                    'param4' => $data['salon_name'] ?? 'Barbershop Jalal'
                ],
                ['template' => "event_rsvp_reminder_2"]
            );

            return $this->json([
                'status' => 'success',
                'message' => 'Cancellation notification sent successfully',
                'details' => [
                    'phone_number' => $phoneNumber,
                    'template' => "event_rsvp_reminder_2",
                ]
            ]);

        } catch (WhatsAppApiException $e) {
            // Handle WhatsApp API specific errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'details' => [
                    'status_code' => $e->getStatusCode(),
                    'api_response' => $e->getApiResponse()
                ]
            ], Response::HTTP_BAD_GATEWAY);
        } catch (\InvalidArgumentException $e) {
            // Handle validation errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            // Handle all other errors
            return $this->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while sending the notification',
                'details' => [
                    'error' => $e->getMessage()
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/notification/test/declined', name: 'notification_test_declined', methods: ['POST'])]
    public function testDeclined(Request $request): JsonResponse
    {
        try {
            // Get data from request
            $data = json_decode($request->getContent(), true);
            
            // Format phone number
            $phoneNumber = $data['phone_number'] ?? '212601498690';
            $phoneNumber = ltrim($phoneNumber, '+0');
            if (!str_starts_with($phoneNumber, '212')) {
                $phoneNumber = '212' . $phoneNumber;
            }

            // Send declined notification
            $success = $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $data['customer_name'] ?? 'John Doe',
                    'param2' => $data['date'] ?? '2024-01-01',
                    'param3' => $data['time'] ?? '14:00',
                    'param4' => $data['signature'] ?? 'Barbershop Jalal'
                ],
                ['template' => "cancel__appoitement"]
            );

            return $this->json([
                'status' => 'success',
                'message' => 'Declined notification sent successfully',
                'details' => [
                    'phone_number' => $phoneNumber,
                    'template' => "cancel__appoitement",
                ]
            ]);

        } catch (WhatsAppApiException $e) {
            // Handle WhatsApp API specific errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'details' => [
                    'status_code' => $e->getStatusCode(),
                    'api_response' => $e->getApiResponse()
                ]
            ], Response::HTTP_BAD_GATEWAY);
        } catch (\InvalidArgumentException $e) {
            // Handle validation errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            // Handle all other errors
            return $this->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while sending the notification',
                'details' => [
                    'error' => $e->getMessage()
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/notification/test/verification', name: 'notification_test_verification', methods: ['POST'])]
    public function testVerification(Request $request): JsonResponse
    {
        try {
            // Get data from request
            $data = json_decode($request->getContent(), true);
            
            // Format phone number
            $phoneNumber = $data['phone_number'] ?? '212601498690';
            $phoneNumber = ltrim($phoneNumber, '+0');
            if (!str_starts_with($phoneNumber, '212')) {
                $phoneNumber = '212' . $phoneNumber;
            }
            // Send verification code
            $success = $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                [
                    'recipient_id' => $phoneNumber,
                    'code' => $data['code'] ?? '123456'
                ],
                ['template' => "verification_password"]
            );

            return $this->json([
                'status' => 'success',
                'message' => 'Verification code sent successfully',
                'details' => [
                    'phone_number' => $phoneNumber,
                    'template' => "verification_password",
                ]
            ]);

        } catch (WhatsAppApiException $e) {
            // Handle WhatsApp API specific errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'details' => [
                    'status_code' => $e->getStatusCode(),
                    'api_response' => $e->getApiResponse()
                ]
            ], Response::HTTP_BAD_GATEWAY);
        } catch (\InvalidArgumentException $e) {
            // Handle validation errors
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Throwable $e) {
            // Handle all other errors
            return $this->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while sending the notification',
                'details' => [
                    'error' => $e->getMessage()
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
