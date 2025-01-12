<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Generator\Url;

use App\Entity\CancellationUrl;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\UriSigner;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

readonly class CancellationUrlGenerator implements UrlInterface
{
    public function __construct
    (
        private UriSigner $uriSigner,
        private EntityManagerInterface $entityManager,
    )
    {}

    public function generateUrl($entity, \DateTimeImmutable $expiredAt, string $url): string
    {
        $dateTime = new \DateTime();

        //signing the url
        $signedUrl = $this->uriSigner->sign($url, $expiredAt->getTimestamp());
        $queryParams = $this->getQueryParams($signedUrl);

        //building the entity
        $cancellationUrlEntity = new CancellationUrl();
        $cancellationUrlEntity->setToken($queryParams['_hash'])
            ->setExpiration($dateTime->setTimestamp($queryParams["_expiration"]))
            ->setUsed(false)
            ->setAppointment($entity);


        $this->entityManager->persist($cancellationUrlEntity);
        $this->entityManager->flush();

        return $signedUrl;
    }

    public function checkUrl(string $url): CancellationUrl
    {
        if (!$this->uriSigner->check($url)) {
            throw new AccessDeniedHttpException("Unauthorized: Invalid or tampered URL.");
        }

        $queryParams = $this->getQueryParams($url);

        if (empty($queryParams['_hash']) || empty($queryParams['_expiration'])) {
            throw new BadRequestException("Missing required query parameters: '_hash' or '_expiration'.");
        }

        $cancellationUrl = $this->entityManager->getRepository(CancellationUrl::class)->findOneBy([
            'token' => $queryParams['_hash'],
        ]);
        if (!$cancellationUrl) {
            throw new EntityNotFoundException("Cancellation URL not found or already used.", );
        }
        return $cancellationUrl;
    }

    public function getQueryParams($url): array
    {
        $query_params = [];

        parse_str(parse_url($url, PHP_URL_QUERY), $query_params);

        return $query_params;
    }
}