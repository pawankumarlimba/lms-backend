import { Document, Schema, SchemaDefinition, SchemaOptions } from "mongoose";

/**
 * Every collection in this system gets these fields for free:
 * - timestamps (createdAt/updatedAt) via schema option
 * - isDeleted: soft-delete flag so records are never destructively lost
 *   (an LMS is an audit-sensitive domain - hard deletes are dangerous).
 */
export interface IBaseDocument extends Document {
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const baseSchemaDefinition = {
  isDeleted: { type: Boolean, default: false, select: false },
};

// `any` here is intentional and scoped to this one factory: Mongoose's
// SchemaOptions/toJSON typings are invariant in ways that don't compose
// across an arbitrary generic <T>, and re-deriving them per model would
// defeat the point of a shared base factory. The public surface
// (createBaseSchema<T>) is still fully typed for every caller.
const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.isDeleted;
      delete ret.password;
      return ret;
    },
  },
} as const;

/**
 * Factory function every model uses to build its schema. Guarantees the
 * same base fields + toJSON behaviour everywhere instead of every model
 * re-declaring it (DRY + consistent naming convention across collections).
 */
export function createBaseSchema<T>(
  definition: SchemaDefinition,
  options: SchemaOptions = {}
): Schema<T> {
  const schema = new Schema(
    { ...baseSchemaDefinition, ...definition } as SchemaDefinition,
    { ...(baseSchemaOptions as unknown as SchemaOptions), ...options }
  );
  return schema as unknown as Schema<T>;
}
