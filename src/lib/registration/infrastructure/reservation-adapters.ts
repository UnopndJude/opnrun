import type {
  Clock,
  ReservationIdGenerator,
  ReservationRepository
} from "@/lib/registration/application/reserve-registration";
import type {
  RegistrationSnapshot,
  Reservation
} from "@/lib/registration/domain/reservation";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class CryptoReservationIdGenerator implements ReservationIdGenerator {
  nextId(): string {
    return `mock_${crypto.randomUUID()}`;
  }
}

export type StoredReservation = {
  reservation: Reservation;
  registration: RegistrationSnapshot;
};

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly reservations: StoredReservation[] = [];

  async save(
    reservation: Reservation,
    registration: RegistrationSnapshot
  ): Promise<void> {
    this.reservations.push({ reservation, registration });
  }

  all(): StoredReservation[] {
    return [...this.reservations];
  }
}

export function createMockReservationDependencies() {
  return {
    clock: new SystemClock(),
    idGenerator: new CryptoReservationIdGenerator(),
    reservationRepository: new InMemoryReservationRepository()
  };
}
