<?php

namespace App\Controller;

use App\Entity\User;
use App\Exception\CodeExpiredException;
use App\Service\PhoneNumberVerificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class VerifyCodeController extends AbstractController
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

        if (!$data || !isset($data['user'], $data['code'])) {
            return $this->json(
                ['error' => 'Invalid request data. "user" and "code" are required.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $code = $data['code'];
        $user = $this->deserialize($data['user']);

        try {
            $this->numberVerificationService->verifyCode($user, $code);
            return $this->json(['message' => 'Account verification successful.'], Response::HTTP_OK);
        }catch (CodeExpiredException $e){
            return $this->json(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'An unexpected error occurred.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function deserialize(string $url): User|JsonResponse
    {
        $path = parse_url($url, PHP_URL_PATH);
        $segments = explode('/', trim($path, '/'));
        $userId = end($segments);

        if (!ctype_digit($userId)){
            return new JsonResponse(['error' => 'Invalid URL format'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->entityManager->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        return $user;
    }
}
