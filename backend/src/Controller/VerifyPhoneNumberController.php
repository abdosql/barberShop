<?php

namespace App\Controller;

use App\Entity\User;
use App\Exception\CodeExpiredException;
use App\Exception\InvalidVerificationCode;
use App\Service\PhoneNumberVerificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class VerifyPhoneNumberController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly PhoneNumberVerificationService $numberVerificationService
    )
    {
    }

    #[Route('/api/verify_code', name: 'app_verify_code', methods: ["POST"])]
    public function index(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['code'], $data['user'])) {
            return $this->json(
                ['error' => 'Invalid request data. "code" and "user" are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $code = $data['code'];

        $user = $this->numberVerificationService->deserialize($data['user']);

        if ($user instanceof JsonResponse) {
            return $user;
        }
        try {
            $this->numberVerificationService->verifyCode($user, $code);

            return $this->json(['message' => 'Account verification successful.'], Response::HTTP_OK);
        } catch (CodeExpiredException|InvalidVerificationCode $e) {
            return $this->json(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'An unexpected error occurred.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/api/resend_verification', name: 'app_resend_code', methods: ["POST"])]
    public function resend(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['phoneNumber'])) {
            return $this->json(
                ['error' => 'Invalid request data. "phoneNumber" is required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $phoneNumber = $data['phoneNumber'];
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['phoneNumber' => $phoneNumber]);

        if (!$user) {
            return $this->json(['error' => 'User not found.'], Response::HTTP_NOT_FOUND);
        }
        try {
            $this->numberVerificationService->createVerification($user);

            return $this->json([
                'message' => 'Verification code was send successfully.',
                'userId' => '/api/users/' . $user->getId()
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'An unexpected error occurred while sending verification code.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
