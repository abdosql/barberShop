<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;

class MercureController extends AbstractController
{
    #[Route('/send-request', name: 'app_send_mercure_notification')]
    public function publish(HubInterface $hub): Response
    {
        $update = new Update(
            'http://localhost/books/1',
            json_encode(['status' => 'OutOfStock'])
        );

        $hub->publish($update);

        return new Response('published!');
    }

    #[Route('/', name: 'app_mercure_receiver')]
    public function subscriber(): Response
    {
        return $this->render('mercure/index.html.twig', [
            'mercure_public_url' => $this->getParameter('mercure.public_url'),
        ]);
    }
}