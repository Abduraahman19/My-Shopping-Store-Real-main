import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./index.module.scss";
import Button from "../../components/components/Button";
import {
  incrementItemFromCart,
  reduceItemFromCart,
  removeItemFromCart,
} from "../../features/cart/cartSlice";
import { MdArrowBack, MdCheck, MdDelete } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { TbTruckReturn } from "react-icons/tb";
import Spinner from "../../components/components/Spinner";
import OrderPopup from "../../components/components/orderPopup";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  description?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Cart = () => {
  const { cartItems, isLoading } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  // Clean product data before sending to Stripe
  const cleanProductData = (products: CartItem[]) => {
    return products.map(item => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.image 
          ? encodeURI(item.product.image.replace(/[^\x00-\x7F]/g, ""))
          : "",
        price: Number(item.product.price) || 0,
        description: item.product.description 
          ? item.product.description.substring(0, 200)
          : ""
      }
    }));
  };

  // Handle payment processing
  const makePayment = async () => {
    setIsProcessing(true);
    
    try {
      const stripe = await loadStripe("pk_test_51RE6d5QR7soFUPBeu2CxSsOHpvsVOu1s4UIEHRPDuQABGsY0JOMsighZtyUIgSWqp0XqVjK3K5i5wAvaOrkD4JLN00BEzrADK3");
      
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const cleanedProducts = cleanProductData(cartItems);
      const body = {
        products: cleanedProducts,
        totalPrice: totalPrice
      };

      const response = await fetch("http://localhost:5000/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const { sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        throw result.error;
      }

    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <section className={styles.section}>
      <div className={`${styles.container} main-container`}>
        <div className={styles.titleContainer}>
          <Button className={styles.iconContainer} onClick={() => navigate(-1)}>
            <MdArrowBack className={styles.icon} />
          </Button>
          <div className={styles.title}>Shopping Bag</div>
        </div>

        {cartItems.length > 0 ? (
          <div className={styles.content}>
            <div className={styles.cartLeft}>
              {cartItems.map((item) => (
                <div key={item.product.id} className={styles.cartCardWrapper}>
                  <Link
                    to={`/products/${item.product.id}`}
                    className={styles.cartCardContainer}
                  >
                    <img
                      src={item.product.image}
                      className="w-80 h-80 rounded-3xl"
                      alt={item.product.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.png";
                      }}
                    />
                    <div className={styles.cartCardDetails}>
                      <div className={styles.cartCardLeft}>
                        <div className="text-4xl w-screen max-w-80 mb-6">
                          {item.product.title}
                        </div>
                        <div className="text-4xl w-screen max-w-80 mb-10">
                          Rs. {item.product.price.toFixed(2)}
                        </div>
                        <div className="w-screen flex gap-2 font-bold text-4xl">
                          <div className={styles.iconContainer}>
                            <TbTruckReturn className={styles.icon} />
                          </div>
                          <div className="text-3xl w-screen text-black">
                            14 days return available!
                          </div>
                        </div>
                        <div className="w-screen flex gap-2 font-bold text-4xl">
                          <div className={styles.iconContainer}>
                            <MdCheck className="text-green-600" />
                          </div>
                          <div className="text-3xl w-screen text-black">
                            Delivery by 2 days
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className={styles.cartCardRight}>
                    <div className={styles.cartCardRightWrapper}>
                      <Button
                        className={styles.button}
                        onClick={() => dispatch(reduceItemFromCart(item.product))}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <div className={styles.counter}>{item.quantity}</div>
                      <Button
                        className={styles.button}
                        onClick={() => dispatch(incrementItemFromCart(item.product))}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      className="text-4xl py-5 pl-28 hover:text-red-600"
                      onClick={() => dispatch(removeItemFromCart(item.product.id))}
                    >
                      <MdDelete className={styles.icon} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartRight}>
              <div className={styles.coupon}>
                <div className={styles.title}>Coupons</div>
                <div className={styles.couponContent}>
                  <div className={styles.iconContainer}>
                    <BiPurchaseTag className={styles.icon} />
                  </div>
                  <div className={styles.title}>Apply Coupons</div>
                  <Button className={styles.button}>Apply</Button>
                </div>
              </div>

              <div className={styles.priceDetails}>
                <div className={styles.title}>Price Details</div>
                <div className={styles.priceContent}>
                  <div className={styles.title}>Total MRP</div>
                  <div className={styles.price}>Rs {totalPrice.toFixed(2)}</div>
                </div>
                <div className={styles.priceContent}>
                  <div className={styles.title}>Platform Fee</div>
                  <div className={styles.price}>FREE</div>
                </div>
                <div className={styles.priceContent}>
                  <div className={styles.title}>Shipping Fee</div>
                  <div className={styles.price}>FREE</div>
                </div>
              </div>

              <div className={styles.totalContent}>
                <div className="flex flex-col items-center gap-4 justify-center">
                  <div className="flex items-center gap-4 justify-center">
                    <div>
                      <div className={styles.title}>Total Amount</div>
                    </div>
                    <div className="mt-[-14px] text-3xl">
                      Rs. {totalPrice.toFixed(2)}
                    </div>
                  </div>
                  <Link
                    to="/catalog/All"
                    className="text-2xl mt-[-20px] underline hover:text-orange-600"
                  >
                    Continue Shopping
                  </Link>
                  <div className="flex items-center gap-4 justify-center">
                    <OrderPopup />
                    <Button
                      className="bg-orange-600/85 py-4 text-2xl my-3 hover:shadow-md hover:shadow-black px-8 rounded-full text-white transition-all duration-200 ease-in-out transform hover:bg-orange-600/95 hover:scale-105 active:scale-95 active:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={makePayment}
                      disabled={isProcessing || cartItems.length === 0}
                    >
                      {isProcessing ? "Processing..." : 
                       cartItems.length === 0 ? "Cart is Empty" : "Pay With Stripe"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <div className="text-7xl">No Items Here</div>
            <Link
              to="/catalog/All"
              className="text-4xl bg-orange-600 py-7 px-10 mt-2 rounded-full hover:text-white text-orange-950"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;