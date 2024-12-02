<?php

namespace App\Controller;

use App\Service\Notification\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class
NotificationController extends AbstractController
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    #[Route('/notification', name: 'app_notification')]
    public function index(): Response
    {
        $this->notificationService->notify(
            '+212708083110',
            '{ \"messaging_product\": \"whatsapp\", \"to\": \"\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }',
            'telegram'
        );
        return new Response("good");
    }
}
