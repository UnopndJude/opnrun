import { describe, expect, it } from "vitest";
import { createReservationLock } from "@/lib/registration/domain/reservation";

describe("reservation domain", () => {
  it("creates a 10 minute reservation lock", () => {
    const now = new Date("2026-06-25T00:00:00.000Z");

    const reservation = createReservationLock({
      id: "mock_test",
      eventId: "opnrun-seoul-2026",
      now
    });

    expect(reservation).toEqual({
      id: "mock_test",
      eventId: "opnrun-seoul-2026",
      status: "reserved",
      createdAt: "2026-06-25T00:00:00.000Z",
      lockExpiresAt: "2026-06-25T00:10:00.000Z"
    });
  });
});
