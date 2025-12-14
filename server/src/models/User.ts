import mongoose, { Document, Schema } from 'mongoose';

// Define the three roles as an Enum
export enum UserRole {
  CONSUMER = 'CONSUMER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN'
}

// Define the TypeScript Interface (The shape of the data object)
export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  role: UserRole;
  customId?: string; // e.g., USR-1004 (We will generate this later)
  isVerified?: boolean; // Specifically for Business status
  adminSecretVerified?: boolean; // Specifically for Admin session state
  createdAt: Date;
}

// Define the Mongoose Schema (The database configuration)
const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.CONSUMER 
  },
  
  customId: { type: String }, // specific user id
  
  // Fields for specific roles
  isVerified: { type: Boolean, default: false }, // For businesses
  adminSecretVerified: { type: Boolean, default: false }, // For admins
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

export default mongoose.model<IUser>('User', UserSchema);