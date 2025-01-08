<?php

namespace App\Controller;

use App\Entity\PhoneNumberVerification;
use App\Entity\User;
use App\Exception\CodeExpiredException;
use App\Service\PhoneNumberVerificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class ResetPasswordController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly PhoneNumberVerificationService $verificationService,
        private readonly UserPasswordHasherInterface $passwordHasher
    )
    {
    }

    #[Route('/api/request_password_reset', name: 'app_request_password_reset', methods: ["POST"])]
    public function requestReset(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data["phoneNumber"])) {
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
            $this->verificationService->createVerification($user, PhoneNumberVerification::TYPE_PASSWORD_RESET);
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

    #[Route('/api/reset_password', name: 'app_reset_password', methods: ["POST"])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['code'], $data['user'], $data['newPassword'])) {
            return $this->json(
                ['error' => 'Invalid request data. "code", "user", and "newPassword" are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $code = $data['code'];
        $newPassword = $data['newPassword'];

        if (strlen($newPassword) < 3 ){
            return $this->json(['error' => 'Password must be at least 3 characters long.'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->verificationService->deserialize($data['user']);

        if ($user instanceof JsonResponse) {
            return $user;
        }

        try {
            if ($this->verificationService->verifyCode($user, $code, PhoneNumberVerification::TYPE_PASSWORD_RESET)) {
                // Hash and set the new password
                $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
                $user->setPassword($hashedPassword);

                $this->entityManager->persist($user);
                $this->entityManager->flush();

                return $this->json(['message' => 'Password has been reset successfully.'], Response::HTTP_OK);
            }
            return $this->json(['error' => 'Reset code is invalid or expired.'], Response::HTTP_BAD_REQUEST);
        } catch (CodeExpiredException $e) {
            return $this->json(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'An unexpected error occurred.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
