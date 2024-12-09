<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Publisher;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Serializer\SerializerInterface;

readonly class DefaultPublisher implements PublisherInterface
{
    public function __construct(
        private HubInterface $hub,
        private SerializerInterface $serializer
    ) {
    }

    public function publish(string|array $topics, mixed $data): void
    {
        $topics = is_array($topics) ? $topics : [$topics];
        $payload = $this->serializer->serialize($data, 'json');
        
        $update = new Update(
            topics: $topics,
            data: $payload,
            private: false
        );

        $this->hub->publish($update);
    }
}