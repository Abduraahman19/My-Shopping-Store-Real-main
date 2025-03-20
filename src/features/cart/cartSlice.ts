import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import cartService from "./cartService";
import { toast } from "react-toastify";
import { CartItem } from "../../types/cart";
import { STATUS } from "../../constants/Status";
import { Product } from "../../types/product";

// Define cart state structure
interface CartState {
  cartItems: CartItem[];
  totalItems: number;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  status: string;
}

// Helper function: Load cart items from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedData = JSON.parse(cartData);
      return parsedData.map((item: CartItem) => ({
        ...item,
        quantity: parseInt(item.quantity.toString(), 10), // Ensure quantity is a number
      }));
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

// Helper function: Calculate total items
const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
};

// Initial state generator function
const getInitialState = (): CartState => {
  const storedCartItems = loadCartFromStorage();
  return {
    cartItems: storedCartItems,
    totalItems: calculateTotalItems(storedCartItems),
    isError: false,
    isSuccess: false,
    isLoading: false,
    status: "",
  };
};

// Initial state
const initialState: CartState = getInitialState();

// Async Thunk: Add item to cart
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

// Async Thunk: Remove item from cart
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

// Async Thunk: Reduce item quantity
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

// Async Thunk: Increment item quantity
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

// Cart Slice
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Reset the cart and clear localStorage
    cartReset: (state) => {
      state.cartItems = [];
      state.totalItems = 0;
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.status = STATUS.IDLE;

      // Clear cart from localStorage
      localStorage.removeItem("cart");
      toast.success("Cart cleared successfully!");
    },

    // Synchronize Redux state with localStorage
    syncWithLocalStorage: (state) => {
      const storedItems = loadCartFromStorage();
      state.cartItems = storedItems;
      state.totalItems = calculateTotalItems(storedItems);
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.status = STATUS.LOADING;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        state.isLoading = false;
        state.isSuccess = true;
        const itemIndex = state.cartItems.findIndex(
          (item) => item.product.id === action.payload.product.id
        );
        if (itemIndex >= 0) {
          state.cartItems[itemIndex].quantity += 1;
          state.totalItems += 1;
        } else {
          const product = { ...action.payload, quantity: 1 };
          state.totalItems += 1;
          state.cartItems.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(state.cartItems));
        state.status = STATUS.IDLE;
        toast.success("Item added to cart!");
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.status = STATUS.ERROR;
        toast.error("Error adding item to cart.");
      })

      // Remove from cart
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.isSuccess = true;
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
        state.totalItems += 1;
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
        toast.success("Item quantity increased.");
      });
  },
});

// Export actions
export const { cartReset, syncWithLocalStorage } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
