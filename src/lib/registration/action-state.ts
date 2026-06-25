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
      reservation: {
        id: string;
        eventId: string;
        status: "reserved";
        createdAt: string;
        lockExpiresAt: string;
      };
    };

export const initialRegistrationState: RegistrationActionState = {
  status: "idle",
  fieldErrors: {},
  message: ""
};
