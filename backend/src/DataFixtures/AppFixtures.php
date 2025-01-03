<?php

namespace App\DataFixtures;

use App\Entity\Service;
use App\Entity\TimeSlot;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->createAdmin($manager);
        $this->generateServices($manager);

        $manager->flush();
    }

    public function createAdmin(ObjectManager $manager): void
    {
        $admin = new User();
        $admin2 = new User();
        $admin
            ->setRoles(['ROLE_ADMIN'])
            ->setLastName("Saqqal")
            ->setFirstName("Abdelaziz")
            ->setPhoneNumber("0708083110")
            ->setPassword('$2y$13$LEHnsMrPritNgyrQfXZTmupMdCPZFErQ0yb8FIrlj8ND4hramDWr6')
            ->setActive("true");
        ;
        $admin2
            ->setRoles(['ROLE_ADMIN'])
            ->setLastName("Jalal")
            ->setFirstName("Benbachir")
            ->setPhoneNumber("0609745046")
            ->setPassword('$2y$13$LEHnsMrPritNgyrQfXZTmupMdCPZFErQ0yb8FIrlj8ND4hramDWr6')
            ->setActive("true");

        ;

        $manager->persist($admin);
        $manager->persist($admin2);
    }

    public function generateServices(ObjectManager $manager): void
    {
        $servicesData = [
            ['name' => 'Coupe de cheveux', 'duration' => 30, 'price' => 20, 'description' => 'Une coupe classique.'],
            ['name' => 'Taille de barbe', 'duration' => 15, 'price' => 15, 'description' => 'Entretien et stylisation de la barbe.'],
            ['name' => 'Shampoing', 'duration' => 10, 'price' => 10, 'description' => 'Nettoyage des cheveux avec shampoing.'],
            ['name' => 'Coloration', 'duration' => 60, 'price' => 50, 'description' => 'Coloration personnalisée.'],
            ['name' => 'Lissage', 'duration' => 90, 'price' => 70, 'description' => 'Lissage professionnel.'],
            ['name' => 'Rasage complet', 'duration' => 30, 'price' => 25, 'description' => 'Rasage traditionnel à la lame.'],
            ['name' => 'Massage du cuir chevelu', 'duration' => 20, 'price' => 15, 'description' => 'Relaxation du cuir chevelu.'],
            ['name' => 'Soins capillaires', 'duration' => 40, 'price' => 30, 'description' => 'Traitement pour cheveux.'],
            ['name' => 'Coupe enfant', 'duration' => 20, 'price' => 15, 'description' => 'Coupe de cheveux pour enfant.'],
            ['name' => 'Service premium', 'duration' => 120, 'price' => 100, 'description' => 'Un service complet et personnalisé.'],
        ];

        foreach ($servicesData as $data) {
            $service = new Service();
            $service->setName($data['name']);
            $service->setDuration($data['duration']);
            $service->setPrice($data['price']);
            $service->setDescription($data['description']);
            $manager->persist($service);
        }

        //timeslots

        $startTime = new DateTimeImmutable('10:30');
        $endTime = new DateTimeImmutable('21:00');

        $intervals = $this->generateTimeIntervals($startTime, $endTime);

        // Create and persist time slots in the database
        foreach ($intervals as $timeInterval) {
            $timeSlot = new TimeSlot();
            $timeSlot->setStartTime($timeInterval['start']);
            $timeSlot->setEndTime($timeInterval['end']);
            $manager->persist($timeSlot);
        }
    }
    public function generateTimeIntervals(DateTimeImmutable $startTime, DateTimeImmutable $endTime): array
    {
        $intervals = [];

        // Continue adding slots until we reach or surpass the end time
        while ($startTime < $endTime) {
            // Create the slot and store it as an array with 'start' and 'end'
            $interval = [];
            $interval['start'] = $startTime;

            // Modify the start time by adding 30 minutes for the end time
            $startTime = $startTime->modify('+30 minutes');
            $interval['end'] = $startTime;

            $intervals[] = $interval;
        }

        return $intervals;
    }
}
