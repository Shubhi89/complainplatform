import Counter from '../models/Counter';

/**
 * Generates a formatted ID (e.g., USR-0005)
 * @param sequenceName The name of the counter (e.g., 'user_id')
 * @param prefix The prefix string (e.g., 'USR')
 * @returns A string like "USR-0005"
 */
export const generateCustomId = async (sequenceName: string, prefix: string): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } }, // Increment seq by 1
    { new: true, upsert: true } // Return the updated document; create if it doesn't exist
  );

  // Pad the number with zeros to ensure a fixed length (e.g., 5 -> "0005")
  const seqValue = counter.seq;
  const paddedSeq = seqValue.toString().padStart(4, '0');

  return `${prefix}-${paddedSeq}`;
};