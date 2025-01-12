<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Generator\Url;

interface UrlInterface
{
    public function generateUrl(mixed $entity, \DateTimeImmutable $expiredAt, string $url): string;
    public function checkUrl(string $url): object;
}