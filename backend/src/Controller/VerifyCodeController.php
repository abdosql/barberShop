<?php

namespace App\Controller;

use App\Entity\PhoneNumberVerification;
use App\Service\PhoneNumberVerificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class VerifyCodeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PhoneNumberVerificationService $numberVerificationService
    )
    {
    }

    #[Route('/api/verify_code', name: 'app_verify_code', methods: ["POST"])]
    public function index(Request $request): Response
    {
        $code = $request->request;
        
        $phoneNumber = $request->request->get("phoneNumber");

        //verifying the code
        return $this->json(['message' => 'Code verification successful', "code" => $code, "phoneNumber" => $phoneNumber]);
    }
}
