import mongoose, { Schema, Document } from 'mongoose';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface IBusinessProfile extends Document {
  user: mongoose.Types.ObjectId; // Link to the User Login
  companyName: string;
  industry: string;
  description: string;
  
  // Verification Data
  documentUrl: string; 
  status: VerificationStatus;
  rejectionReason?: string;
  submittedAt: Date;
}

const BusinessProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  companyName: { type: String, required: true, index: true }, 
  industry: { type: String, required: true },
  description: { type: String, required: true },

  documentUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(VerificationStatus), 
    default: VerificationStatus.PENDING 
  },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IBusinessProfile>('BusinessProfile', BusinessProfileSchema);