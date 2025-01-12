<?php

namespace App\Controller;

use App\Generator\Url\CancellationUrlGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UrlCheckerController extends AbstractController
{
    public function __construct
    (
        private readonly CancellationUrlGenerator $urlGenerator,
    )
    {
    }

    #[Route('/api/url/appointment/cancellation/checker', name: 'app_url_appointment_cancellation_checker', methods: ['POST'])]
    public function urlCancellationCheck(Request $request): JsonResponse
    {
        $urlToCheck = $request->headers->get('X-Check-Url');

        if (!$urlToCheck) {
            return $this->json([
                'error' => 'Missing URL in X-Check-Url header'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->urlGenerator->checkUrl($urlToCheck);

            return $this->json([
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], Response::HTTP_FORBIDDEN);
        }
    }
}
