<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Generator\Url\CancellationUrlGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\UriSigner;
use Symfony\Component\Routing\Attribute\Route;

class TestController extends AbstractController
{
    public function __construct(private readonly CancellationUrlGenerator $cancellationUrl, private UriSigner $uriSigner)
    {
    }

    /**
     * @throws \Exception
     */
    #[Route('/api/generate', name: 'app_test')]
    public function index(): JsonResponse
    {
        $appointment = new Appointment();
        return $this->json(["uri" => $this->uriSigner->sign("appointment/cancel", new \DateTimeImmutable("+24 Hours"))]);
    }
    #[Route('/api/verify', name: 'verify')]
    public function verify(): JsonResponse
    {
        return $this->json(["uri" => $this->uriSigner->check("http://localhost/appointment/Cancel?_expiration=1736787600&_hash=uf8uTvlpNFEyNBs9QwzxBN6WRZ9Qs1t1l%2B5G0Rr4IhM%3D")]);
    }
}
