import {
  createReservationLock,
  type RegistrationSnapshot,
  type Reservation
} from "@/lib/registration/domain/reservation";

export type ReserveRegistrationCommand = {
  eventId: string;
  registration: RegistrationSnapshot;
};

export type Clock = {
  now(): Date;
};

export type ReservationIdGenerator = {
  nextId(): string;
};

export type ReservationRepository = {
  save(reservation: Reservation, registration: RegistrationSnapshot): Promise<void>;
};

export type ReserveRegistrationDependencies = {
  clock: Clock;
  idGenerator: ReservationIdGenerator;
  reservationRepository: ReservationRepository;
};

export async function reserveRegistration(
  command: ReserveRegistrationCommand,
  dependencies: ReserveRegistrationDependencies
): Promise<Reservation> {
  const reservation = createReservationLock({
    id: dependencies.idGenerator.nextId(),
    eventId: command.eventId,
    now: dependencies.clock.now()
  });

  await dependencies.reservationRepository.save(
    reservation,
    command.registration
  );

  return reservation;
}
