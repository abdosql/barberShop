<?php

namespace App\Controller;

use App\Service\Notification\Contract\NotificationServiceInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class NotificationController extends AbstractController
{
    public function __construct(
        private readonly NotificationServiceInterface $notificationService
    ) {
    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    #[Route('/notification', name: 'notification_index', methods: ['POST'])]
    public function index(): JsonResponse
    {
        try {
            $details = [
                'phone_number' => '+212601498690',
                'customer_name' => 'John Doe',
                'service' => 'Haircut & Beard Trim',
                'date_time' => '2024-03-20 14:30',
                'barber_name' => 'Mike Smith',
                'language' => 'fr'
            ];

            $this->notificationService->notify($details);

            return $this->json([
                'status' => 'success',
                'message' => 'Notification sent successfully'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
