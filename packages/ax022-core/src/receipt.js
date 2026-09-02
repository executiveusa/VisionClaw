import { createHmac, randomUUID } from 'node:crypto';

export function createReceiptSigner(secret) {
  if (!secret) throw new Error('receipt signing secret required');
  return function signReceipt(input) {
    const receipt = {
      receiptId: randomUUID(),
      at: new Date().toISOString(),
      ...input,
    };
    const canonical = JSON.stringify(receipt);
    const signature = createHmac('sha256', secret).update(canonical).digest('base64url');
    return { ...receipt, signature };
  };
}
