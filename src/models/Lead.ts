import mongoose, { Schema, model, models } from "mongoose";

const LeadSchema = new Schema(
  {
    executiveId: { type: Schema.Types.ObjectId, ref: "Executive", required: true },
    executiveNameSnapshot: { type: String, required: true },

    // ✅ NUEVO (dirección completa)
    fromCurrency: { type: String, enum: ["CLP", "BOB"], required: true },
    toCurrency: { type: String, enum: ["CLP", "BOB"], required: true },
    amountFrom: { type: Number, required: true },
    amountTo: { type: Number, required: true },

    rateSnapshot: { type: Number, required: true },

    // ✅ Compatibilidad con registros antiguos (pueden existir en tu DB)
    amount: { type: Number, required: false },
    currency: { type: String, enum: ["CLP", "BOB"], required: false },
    computedResult: { type: Number, required: false },
    computedCurrency: { type: String, enum: ["CLP", "BOB"], required: false },

    source: { type: String, default: "whatsapp" },
  },
  { timestamps: true }
);

export type LeadDoc = mongoose.InferSchemaType<typeof LeadSchema>;

export default models.Lead || model("Lead", LeadSchema);