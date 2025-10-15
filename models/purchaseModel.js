import { ObjectId } from 'mongodb';

// Purchase Model Schema
export const purchaseSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userEmail", "stripeSessionId", "stripeProductId", "stripePaymentIntentId", "productName", "category", "serviceType", "quantity", "unitPrice", "totalAmount", "currency", "status", "paymentStatus", "purchasedAt", "createdAt", "updatedAt"],
    properties: {
      userId: { bsonType: "string" },
      userEmail: { bsonType: "string" },
      userName: { bsonType: "string" },
      stripeSessionId: { bsonType: "string" },
      stripeCustomerId: { bsonType: "string" },
      stripeProductId: { bsonType: "string" },
      stripePriceId: { bsonType: "string" },
      stripePaymentIntentId: { bsonType: "string" },
      productName: { bsonType: "string" },
      productDescription: { bsonType: "string" },
      category: { bsonType: "string" },
      serviceType: { bsonType: "string" },
      serviceId: { bsonType: "string" },
      quantity: { bsonType: "number" },
      unitPrice: { bsonType: "number" },
      totalAmount: { bsonType: "number" },
      currency: { bsonType: "string" },
      status: { bsonType: "string" },
      paymentStatus: { enum: ["paid", "pending", "failed"] },
      purchasedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      paidAt: { bsonType: "date" },
      metadata: { bsonType: "object" }
    }
  }
};

// Purchase indexes
export const purchaseIndexes = [
  { key: { userId: 1 } },
  { key: { userEmail: 1 } },
  { key: { stripeSessionId: 1 }, unique: true },
  { key: { purchasedAt: -1 } },
  { key: { paymentStatus: 1 } },
  { key: { category: 1 } }
];

// Purchase validation
export const validatePurchase = (purchaseData) => {
  const errors = [];

  if (!purchaseData.userEmail || !purchaseData.userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!purchaseData.stripeSessionId) {
    errors.push('Stripe session ID is required');
  }

  if (!purchaseData.productName || purchaseData.productName.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (purchaseData.totalAmount === undefined || purchaseData.totalAmount < 0) {
    errors.push('Valid total amount is required');
  }

  const validPaymentStatuses = ["paid", "pending", "failed"];
  if (!purchaseData.paymentStatus || !validPaymentStatuses.includes(purchaseData.paymentStatus)) {
    errors.push('Valid payment status is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizePurchase = (purchase) => {
  if (!purchase) return null;

  // Convert ObjectId to string
  if (purchase._id && purchase._id instanceof ObjectId) {
    purchase._id = purchase._id.toString();
  }

  return purchase;
};
