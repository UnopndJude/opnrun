import { describe, expect, it } from "vitest";
import {
  reserveRegistration,
  type ReservationRepository
} from "@/lib/registration/application/reserve-registration";
import type {
  RegistrationSnapshot,
  Reservation
} from "@/lib/registration/domain/reservation";

class SpyReservationRepository implements ReservationRepository {
  saved: Array<{
    reservation: Reservation;
    registration: RegistrationSnapshot;
  }> = [];

  async save(
    reservation: Reservation,
    registration: RegistrationSnapshot
  ): Promise<void> {
    this.saved.push({ reservation, registration });
  }
}

describe("reserve registration use case", () => {
  it("creates and persists a reservation through application ports", async () => {
    const repository = new SpyReservationRepository();
    const registration = {
      email: "runner@example.com",
      privacyConsent: true
    } satisfies RegistrationSnapshot;

    const reservation = await reserveRegistration(
      {
        eventId: "opnrun-seoul-2026",
        registration
      },
      {
        clock: { now: () => new Date("2026-06-25T00:00:00.000Z") },
        idGenerator: { nextId: () => "mock_test" },
        reservationRepository: repository
      }
    );

    expect(reservation.id).toBe("mock_test");
    expect(reservation.lockExpiresAt).toBe("2026-06-25T00:10:00.000Z");
    expect(repository.saved).toEqual([
      {
        reservation,
        registration
      }
    ]);
  });
});
