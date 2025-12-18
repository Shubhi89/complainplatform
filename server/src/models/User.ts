import mongoose, { Document, Schema } from "mongoose";

export enum UserRole {
  CONSUMER = "CONSUMER",
  BUSINESS = "BUSINESS",
  ADMIN = "ADMIN",
}

export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  role: UserRole;
  customId?: string;
  isVerified?: boolean;
  adminSecretVerified?: boolean;
  createdAt: Date;
}

// Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CONSUMER,
    },

    customId: { type: String },

    // Fields for specific roles
    isVerified: { type: Boolean, default: false },
    adminSecretVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
