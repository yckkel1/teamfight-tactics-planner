export type ErrorDetails = Record<string, unknown>;

export class ErrorEnvelope {
    constructor(
        public error: {
            code: string;
            message: string;
            details?: ErrorDetails;
        },
    ) {}
}