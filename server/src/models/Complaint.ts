import mongoose, { Schema, Document } from "mongoose";

export enum ComplaintStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

// Interface for a single Reply in the thread
interface IReply {
  userId: mongoose.Types.ObjectId;
  userName: string;
  role: string;
  content: string;
  timestamp: Date;
}

export interface IComplaint extends Document {
  complaintId: string;
  title: string;
  description: string;
  status: ComplaintStatus;

  // Relationships
  consumer: mongoose.Types.ObjectId;
  business: mongoose.Types.ObjectId;

  // Conversation history
  thread: IReply[];

  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ComplaintSchema: Schema = new Schema(
  {
    complaintId: { type: String, unique: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.PENDING,
    },

    consumer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "User", required: true },

    thread: [ReplySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComplaint>("Complaint", ComplaintSchema);
