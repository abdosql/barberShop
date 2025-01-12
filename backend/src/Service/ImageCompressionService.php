<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service;

use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface as ImageInterfaceAlias;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\KernelInterface;

class ImageCompressionService
{
    private ImageManager $imageManager;
    private string $projectDir;

    public function __construct(KernelInterface $kernel)
    {
        $this->imageManager = new ImageManager(new Driver());
        $this->projectDir = $kernel->getProjectDir();
    }

    /**
     * @throws \Exception
     */
    public function compressExistingImage(
        string $imagePath,
        int $quality = 75,
        ?int $maxWidth = 1200,
        ?int $maxHeight = 1200,
        string $format = 'jpg'
    ): string {
        $fullPath = $this->projectDir . '/public/assets/' . ltrim($imagePath, '/');

        if (!file_exists($fullPath)) {
            throw new \Exception('Image file not found in assets directory');
        }

        $image = $this->imageManager->read($fullPath);

        if ($maxWidth || $maxHeight) {
            $image = $image->scale(width: $maxWidth, height: $maxHeight);
        }

        // Generate output filename
        $pathInfo = pathinfo($fullPath);
        $newFilename = $pathInfo['filename'] . '_compressed.' . $format;
        $outputPath = $pathInfo['dirname'] . '/' . $newFilename;

        // Save compressed image based on format
        $this->saveCompressedImageBasedOnFormat($format, $image, $quality, $outputPath);

        // Return the public path
        return str_replace($this->projectDir . '/public', '', $outputPath);
    }

    // Previous methods remain the same
    public function compressImage(
        UploadedFile $file,
        int $quality = 75,
        ?int $maxWidth = 1200,
        ?int $maxHeight = 1200,
        string $format = 'jpg'
    ): string {
        $image = $this->imageManager->read($file->getPathname());

        if ($maxWidth || $maxHeight) {
            $image = $image->scale(width: $maxWidth, height: $maxHeight);
        }

        return base64_encode(
            $image->toJpeg($quality)->toString()
        );
    }

    public function compressAndSave(
        UploadedFile $file,
        string $targetPath,
        int $quality = 75,
        ?int $maxWidth = 1200,
        ?int $maxHeight = 1200,
        string $format = 'jpg'
    ): string {
        $image = $this->imageManager->read($file->getPathname());

        if ($maxWidth || $maxHeight) {
            $image = $image->scale(width: $maxWidth, height: $maxHeight);
        }

        $this->saveCompressedImageBasedOnFormat($format, $image, $quality, $targetPath);

        return $targetPath;
    }

    public function saveCompressedImageBasedOnFormat(string $format, ImageInterfaceAlias $image, int $quality, string $outputPath): void
    {
        switch (strtolower($format)) {
            case 'jpg':
            case 'jpeg':
                $image->toJpeg($quality)->save($outputPath);
                break;
            case 'png':
                $image->toPng($quality)->save($outputPath);
                break;
            case 'webp':
                $image->toWebp($quality)->save($outputPath);
                break;
            case 'avif':
                $image->toAvif($quality)->save($outputPath);
                break;
            default:
                throw new \InvalidArgumentException('Unsupported image format');
        }
    }

}