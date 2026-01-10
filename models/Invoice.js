import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  invoiceNumber: String,
  issuedDate: Date,
  amount: Number
});

export default mongoose.model("Invoice", invoiceSchema);
