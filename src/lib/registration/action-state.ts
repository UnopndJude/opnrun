import type { Reservation } from "@/lib/registration/domain/reservation";

export type RegistrationActionState =
  | {
      status: "idle";
      fieldErrors: Record<string, string>;
      message: string;
    }
  | {
      status: "error";
      fieldErrors: Record<string, string>;
      message: string;
    }
  | {
      status: "success";
      fieldErrors: Record<string, string>;
      message: string;
      reservation: Reservation;
    };

export const initialRegistrationState: RegistrationActionState = {
  status: "idle",
  fieldErrors: {},
  message: ""
};
