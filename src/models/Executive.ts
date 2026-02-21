import mongoose, { Schema, model, models } from "mongoose";

const ExecutiveSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true }, // ideal: +591XXXXXXXX
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    // ✅ Soft delete: si tiene fecha, se considera eliminado
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type ExecutiveDoc = mongoose.InferSchemaType<typeof ExecutiveSchema>;

export default models.Executive || model("Executive", ExecutiveSchema);