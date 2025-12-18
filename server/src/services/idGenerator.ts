import Counter from "../models/Counter";

export const generateCustomId = async (
  sequenceName: string,
  prefix: string
): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqValue = counter.seq;
  const paddedSeq = seqValue.toString().padStart(4, "0");

  return `${prefix}-${paddedSeq}`;
};
