import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import cartService from "./cartService";
import { toast } from "react-toastify";
import { CartItem } from "../../types/cart";
import { STATUS } from "../../constants/Status";
import { Product } from "../../types/product";

// Define the state interface
interface CartState {
  cartItems: CartItem[];
  totalItems: number;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  status: string;
}

// Load cart items from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      return JSON.parse(cartData).map((item: CartItem) => ({
        ...item,
        quantity: parseInt(item.quantity.toString(), 10),
      }));
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

// Calculate total items in cart
const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// Initial state
const initialState: CartState = {
  cartItems: loadCartFromStorage(),
  totalItems: calculateTotalItems(loadCartFromStorage()),
  isError: false,
  isSuccess: false,
  isLoading: false,
  status: STATUS.IDLE,
};

// Async thunk for adding to cart
export const addToCart = createAsyncThunk(
  "cart/add",
  async (cartItem: CartItem, thunkAPI) => {
    try {
      return await cartService.addToCart(cartItem);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Async thunk for removing item from cart
export const removeItemFromCart = createAsyncThunk(
  "cart/remove",
  async (id: number, thunkAPI) => {
    try {
      return await cartService.removeItemFromCart(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Async thunk for reducing item quantity
export const reduceItemFromCart = createAsyncThunk(
  "cart/reduce",
  async (cartItem: Product, thunkAPI) => {
    try {
      return await cartService.reduceItemFromCart(cartItem);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Async thunk for incrementing item quantity
export const incrementItemFromCart = createAsyncThunk(
  "cart/increment",
  async (cartItem: Product, thunkAPI) => {
    try {
      return await cartService.incrementItemFromCart(cartItem);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create cart slice
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Reset cart
    cartReset: (state) => {
      state.cartItems = [];
      state.totalItems = 0;
      localStorage.removeItem("cart");
      toast.success("Cart cleared successfully!");
    },

    // Sync state with localStorage
    syncWithLocalStorage: (state) => {
      state.cartItems = loadCartFromStorage();
      state.totalItems = calculateTotalItems(state.cartItems);
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        const itemIndex = state.cartItems.findIndex(
          (item) => item.product.id === action.payload.product.id
        );
        if (itemIndex >= 0) {
          state.cartItems[itemIndex].quantity += 1;
        } else {
          state.cartItems.push({ ...action.payload, quantity: 1 });
        }
        state.totalItems = calculateTotalItems(state.cartItems);
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
        state.isLoading = false;
        toast.success("Item added to cart!");
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        toast.error("Error adding item to cart.");
      })

      // Remove from cart
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<number>) => {
        state.cartItems = state.cartItems.filter(
          (item) => item.product.id !== action.payload
        );
        state.totalItems = calculateTotalItems(state.cartItems);
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
        toast.success("Item removed from cart!");
      })

      // Reduce item quantity
      .addCase(reduceItemFromCart.fulfilled, (state, action: PayloadAction<Product>) => {
        const itemIndex = state.cartItems.findIndex(
          (item) => item.product.id === action.payload.id
        );
        if (itemIndex >= 0) {
          if (state.cartItems[itemIndex].quantity > 1) {
            state.cartItems[itemIndex].quantity -= 1;
          } else {
            state.cartItems.splice(itemIndex, 1);
          }
          state.totalItems = calculateTotalItems(state.cartItems);
          localStorage.setItem("cart", JSON.stringify(state.cartItems));
          toast.success("Item quantity reduced.");
        }
      })

      // Increment item quantity
      .addCase(incrementItemFromCart.fulfilled, (state, action: PayloadAction<Product>) => {
        const itemIndex = state.cartItems.findIndex(
          (item) => item.product.id === action.payload.id
        );

        if (itemIndex >= 0) {
          state.cartItems[itemIndex].quantity += 1;
        } else {
          state.cartItems.push({ product: action.payload, quantity: 1 });
        }
        state.totalItems = calculateTotalItems(state.cartItems);
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
        toast.success("Item quantity increased.");
      });
  },
});

export const { cartReset, syncWithLocalStorage } = cartSlice.actions;
export default cartSlice.reducer;
