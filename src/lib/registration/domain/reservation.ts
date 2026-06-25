export const RESERVATION_LOCK_TTL_MS = 10 * 60 * 1000;

export type ReservationStatus = "reserved";

export type Reservation = {
  id: string;
  eventId: string;
  status: ReservationStatus;
  createdAt: string;
  lockExpiresAt: string;
};

export type RegistrationValue = string | boolean;
export type RegistrationSnapshot = Record<string, RegistrationValue>;

export type CreateReservationLockInput = {
  id: string;
  eventId: string;
  now: Date;
  lockTtlMs?: number;
};

export function createReservationLock({
  id,
  eventId,
  now,
  lockTtlMs = RESERVATION_LOCK_TTL_MS
}: CreateReservationLockInput): Reservation {
  const lockExpiresAt = new Date(now.getTime() + lockTtlMs);

  return {
    id,
    eventId,
    status: "reserved",
    createdAt: now.toISOString(),
    lockExpiresAt: lockExpiresAt.toISOString()
  };
}
