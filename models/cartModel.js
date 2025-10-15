import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

class CartModel {
  constructor() {
    this.collectionName = 'carts';
  }

  getCollection() {
    const db = getDatabase();
    return db.collection(this.collectionName);
  }

  // Find or create cart for user
  async findOrCreateCart(userId) {
    const collection = this.getCollection();

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    let cart = await collection.findOne({ userId: userObjectId });

    if (!cart) {
      const newCart = {
        userId: userObjectId,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newCart);
      cart = { ...newCart, _id: result.insertedId };
    }

    return cart;
  }

  // Calculate totals
  calculateTotals(items) {
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    return { totalAmount, itemCount };
  }

  // Add item to cart
  async addItem(userId, itemData) {
    const collection = this.getCollection();
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    let cart = await this.findOrCreateCart(userObjectId);

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.serviceId === itemData.serviceId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      cart.items[existingItemIndex].quantity += itemData.quantity || 1;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item
      cart.items.push({
        ...itemData,
        quantity: itemData.quantity || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Calculate new totals
    const { totalAmount, itemCount } = this.calculateTotals(cart.items);

    // Update cart
    const result = await collection.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: cart.items,
          totalAmount,
          itemCount,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  // Remove item from cart
  async removeItem(userId, serviceId) {
    const collection = this.getCollection();
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    let cart = await this.findOrCreateCart(userObjectId);

    // Filter out the item
    cart.items = cart.items.filter(item => item.serviceId !== serviceId);

    // Calculate new totals
    const { totalAmount, itemCount } = this.calculateTotals(cart.items);

    // Update cart
    const result = await collection.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: cart.items,
          totalAmount,
          itemCount,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  // Update item quantity
  async updateItemQuantity(userId, serviceId, quantity) {
    const collection = this.getCollection();
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    let cart = await this.findOrCreateCart(userObjectId);

    // Find the item
    const itemIndex = cart.items.findIndex(item => item.serviceId === serviceId);

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return this.removeItem(userId, serviceId);
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].updatedAt = new Date();

    // Calculate new totals
    const { totalAmount, itemCount } = this.calculateTotals(cart.items);

    // Update cart
    const result = await collection.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          items: cart.items,
          totalAmount,
          itemCount,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  // Clear cart
  async clearCart(userId) {
    const collection = this.getCollection();
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    const result = await collection.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set: {
          items: [],
          totalAmount: 0,
          itemCount: 0,
          lastUpdated: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after', upsert: true }
    );

    return result;
  }

  // Get cart by userId
  async getCartByUserId(userId) {
    const userObjectId = typeof userId === 'string' && ObjectId.isValid(userId)
      ? new ObjectId(userId)
      : userId;

    return this.findOrCreateCart(userObjectId);
  }
}

export default new CartModel();
