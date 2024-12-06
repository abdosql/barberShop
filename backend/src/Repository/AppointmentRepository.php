<?php

namespace App\Repository;

use App\Entity\Appointment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Appointment>
 */
class AppointmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Appointment::class);
    }

//    /**
//     * @return Appointment[] Returns an array of Appointment objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('a.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Appointment
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

    /**
     * Find appointments for a specific month
     * @param \DateTime $month First day of the month
     * @return Appointment[]
     */
    public function findByMonth(\DateTime $month): array
    {
        $nextMonth = clone $month;
        $nextMonth->modify('first day of next month');

        return $this->createQueryBuilder('a')
            ->andWhere('a.startTime >= :start')
            ->andWhere('a.startTime < :end')
            ->setParameter('start', \DateTimeImmutable::createFromMutable($month))
            ->setParameter('end', \DateTimeImmutable::createFromMutable($nextMonth))
            ->getQuery()
            ->getResult();
    }
}
