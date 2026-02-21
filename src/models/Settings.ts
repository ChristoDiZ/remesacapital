import mongoose, { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema(
  {
    // singleton
    key: { type: String, required: true, unique: true, default: "global" },

    // ✅ CLP -> BOB (por 1000 CLP)
    clpToBobRate: { type: Number, required: true, default: 0 },

    // ✅ BOB -> CLP (por 1 BOB)
    bobToClpRate: { type: Number, required: true, default: 0 },

    fromCurrency: { type: String, required: true, default: "CLP" },
    toCurrency: { type: String, required: true, default: "BOB" },
  },
  { timestamps: true }
);

export type SettingsDoc = mongoose.InferSchemaType<typeof SettingsSchema>;

export default models.Settings || model("Settings", SettingsSchema);