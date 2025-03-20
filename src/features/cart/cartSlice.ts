import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import cartService from "./cartService";
import { toast } from "react-toastify";
import { CartItem } from "../../types/cart";
import { STATUS } from "../../constants/Status";
import { Product } from "../../types/product";

interface CartState {
  cartItems: CartItem[];
  totalItems: number;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  status: string;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedData = JSON.parse(cartData);
      return parsedData.map((item: CartItem) => ({
        ...item,
        quantity: parseInt(item.quantity.toString(), 10),
      }));
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
};

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

const initialState: CartState = getInitialState();

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

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartReset: (state) => {
      state.cartItems = [];
      state.totalItems = 0;
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.status = STATUS.IDLE;

      localStorage.removeItem("cart");
      toast.success("Cart cleared successfully!");
    },

    syncWithLocalStorage: (state) => {
      const storedItems = loadCartFromStorage();
      state.cartItems = storedItems;
      state.totalItems = calculateTotalItems(storedItems);
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { cartReset, syncWithLocalStorage } = cartSlice.actions;

export default cartSlice.reducer;
