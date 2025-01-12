<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Controller;

use App\Service\ImageCompressionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ImageController extends AbstractController
{
    public function __construct(
        private readonly ImageCompressionService $imageCompressionService
    ) {}

    #[Route('/api/images', name: 'get_images', methods: ['GET'])]
    public function getImages(): Response
    {
        $assetsPath = $this->getParameter('kernel.project_dir') . '/public/assets';
        $images = [];

        // Scan the assets directory for images
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

        foreach (new \DirectoryIterator($assetsPath) as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $allowedExtensions)) {
                    $images[] = [
                        'id' => $file->getBasename('.' . $extension),
                        'name' => $file->getBasename(),
                        'path' => '/assets/' . $file->getBasename(),
                        'size' => $file->getSize(),
                        'lastModified' => $file->getMTime()
                    ];
                }
            }
        }

        return $this->json([
            'images' => $images
        ]);
    }

    #[Route('/api/compress-asset', name: 'compress_asset', methods: ['POST'])]
    public function compressAsset(Request $request): Response
    {
        try {
            $imagePath = $request->request->get('imagePath');

            if (!$imagePath) {
                return $this->json(['error' => 'No image path provided'], 400);
            }

            $quality = $request->request->getInt('quality', 75);
            $maxWidth = $request->request->getInt('maxWidth', 1200);
            $maxHeight = $request->request->getInt('maxHeight', 1200);
            $format = $request->request->get('format', 'jpg');

            $compressedPath = $this->imageCompressionService->compressExistingImage(
                $imagePath,
                $quality,
                $maxWidth,
                $maxHeight,
                $format
            );

            return $this->json([
                'success' => true,
                'original' => [
                    'path' => '/assets/' . $imagePath,
                    'url' => $this->getParameter('app.base_url') . '/assets/' . $imagePath
                ],
                'compressed' => [
                    'path' => $compressedPath,
                    'url' => $this->getParameter('app.base_url') . $compressedPath
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/upload-image', name: 'upload_image', methods: ['POST'])]
    public function uploadImage(Request $request): Response
    {
        $file = $request->files->get('image');

        if (!$file) {
            return $this->json(['error' => 'No image file uploaded'], 400);
        }

        try {
            $quality = $request->request->getInt('quality', 75);
            $maxWidth = $request->request->getInt('maxWidth', 1200);
            $maxHeight = $request->request->getInt('maxHeight', 1200);
            $format = $request->request->get('format', 'jpg');

            // Save to assets directory
            $fileName = uniqid() . '.' . $format;
            $targetPath = $this->getParameter('kernel.project_dir') . '/public/assets/' . $fileName;

            $savedPath = $this->imageCompressionService->compressAndSave(
                $file,
                $targetPath,
                $quality,
                $maxWidth,
                $maxHeight,
                $format
            );

            return $this->json([
                'success' => true,
                'image' => [
                    'path' => '/assets/' . $fileName,
                    'url' => $this->getParameter('app.base_url') . '/assets/' . $fileName,
                    'name' => $fileName
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}