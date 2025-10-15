import CartModel from '../models/cartModel.js';
import { validationResult } from 'express-validator';

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartModel.findOrCreateCart(userId);

    res.json({
      success: true,
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items: cart.items,
          totalAmount: cart.totalAmount,
          itemCount: cart.itemCount,
          lastUpdated: cart.lastUpdated,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const itemData = req.body;

    // Validate required fields
    const requiredFields = ['serviceId', 'title', 'description', 'amount', 'icon', 'category', 'serviceType'];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const cart = await CartModel.addItem(userId, itemData);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items: cart.items,
          totalAmount: cart.totalAmount,
          itemCount: cart.itemCount,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    const cart = await CartModel.removeItem(userId, serviceId);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items: cart.items,
          totalAmount: cart.totalAmount,
          itemCount: cart.itemCount,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// Update item quantity in cart
const updateItemQuantity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const { serviceId } = req.params;
    const { quantity } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      });
    }

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await CartModel.updateItemQuantity(userId, serviceId, quantity);

    res.json({
      success: true,
      message: 'Item quantity updated successfully',
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items: cart.items,
          totalAmount: cart.totalAmount,
          itemCount: cart.itemCount,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item quantity',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartModel.clearCart(userId);

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          _id: cart._id,
          userId: cart.userId,
          items: cart.items,
          totalAmount: cart.totalAmount,
          itemCount: cart.itemCount,
          lastUpdated: cart.lastUpdated
        }
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// Get cart summary (for navigation badge)
const getCartSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartModel.getCartByUserId(userId);

    res.json({
      success: true,
      data: {
        itemCount: cart ? cart.itemCount : 0,
        totalAmount: cart ? cart.totalAmount : 0
      }
    });
  } catch (error) {
    console.error('Error getting cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart summary',
      error: error.message
    });
  }
};

export {
  getCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
  getCartSummary
};
