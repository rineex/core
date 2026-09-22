export type ConstraintResult =
  | {
      /**
       * Stable identifier of the constraint that produced this result.
       */
      readonly constraintId: string;

      /**
       * Indicates that the candidate failed the constraint.
       */
      readonly satisfied: false;

      /**
       * Stable machine-readable explanation of the rejection.
       */
      readonly reasonCode: string;

      /**
       * Optional diagnostic metadata.
       */
      readonly details?: Readonly<Record<string, unknown>>;
    }
  | {
      /**
       * Stable identifier of the constraint that produced this result.
       */
      readonly constraintId: string;

      /**
       * Indicates that the candidate satisfied the constraint.
       */
      readonly satisfied: true;

      /**
       * Optional diagnostic metadata.
       */
      readonly details?: Readonly<Record<string, unknown>>;
    };
