import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./index.module.scss";
import Button from "../../components/components/Button";
import {
  cartReset,
  incrementItemFromCart,
  reduceItemFromCart,
  removeItemFromCart,
} from "../../features/cart/cartSlice";
import { MdArrowBack, MdCheck, MdDelete } from "react-icons/md";
import { BiPurchaseTag } from "react-icons/bi";
import { TbTruckReturn } from "react-icons/tb";
import Spinner from "../../components/components/Spinner";

const Cart = () => {
  const { cartItems, isLoading } = useAppSelector(
    (state) => state.cart
  );
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (a, c) => a + c.quantity * c.product.price,
    0
  );

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
        {cartItems.length ? (
          <div className={styles.content}>
            <div className={styles.cartLeft}>
              <div
                className={styles.emptyCart}
                onClick={() => dispatch(cartReset())}
              >
                Empty Cart
              </div>
              {cartItems.map((item) => {
                return (
                  <div className={styles.cartCardWrapper}>
                    <Link
                      to={`/products/${item.product.id}`}
                      className={styles.cartCardContainer}
                    >
                      <img
                        src={item.product.image}
                        className="w-80 h-80 rounded-3xl"
                        alt={item.product.title}
                      />
                      <div className={styles.cartCardDetails}>
                        <div className={styles.cartCardLeft}>
                          <div className='text-4xl w-screen max-w-80 mb-6'>
                            {item.product.title}
                          </div>
                          <div className='text-4xl w-screen max-w-80 mb-10'>
                            Rs {item.product.price}
                          </div>
                          <div className='w-screen flex gap-2 font-bold text-4xl'>
                            <div className={styles.iconContainer}>
                              <TbTruckReturn className={styles.icon} />
                            </div>
                            <div className='text-3xl w-screen text-black'>
                              14 days return available!
                            </div>
                          </div>
                          <div className='w-screen flex gap-2 font-bold text-4xl'>
                            <div className={styles.iconContainer}>
                              <MdCheck className='text-green-600' />
                            </div>
                            <div className='text-3xl w-screen text-black'>
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
                          onClick={() =>
                            dispatch(reduceItemFromCart(item.product))
                          }
                        >
                          -
                        </Button>
                        <div className={styles.counter}>{item.quantity}</div>
                        <Button
                          className={styles.button}
                          onClick={() =>
                            dispatch(incrementItemFromCart(item.product))
                          }
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        className='text-4xl py-5 pl-28 hover:text-red-600'
                        onClick={() =>
                          dispatch(removeItemFromCart(item.product.id))
                        }
                      >
                        <MdDelete className={styles.icon} />
                      </Button>
                    </div>
                  </div>
                );
              })}
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
                  <div className="mt-[-14px] text-3xl">Rs {totalPrice.toFixed(2)}</div>
                  </div>
                  <Link
                    to="/catalog/All"
                    className="text-2xl mt-[-20px] underline hover:text-orange-600">
                    Continue Shopping
                  </Link>
                  <Button className='bg-orange-600 py-5 px-28 rounded-full hover:text-white text-[#b4b2b2]'>Place Order</Button>
                </div>
              </div>
            </div>
          </div>  
        ) : (
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <div className='text-7xl'>No Items Here</div>
            <Link
              to="/catalog/All"
              className="text-4xl bg-orange-600 py-7 px-10 mt-2 rounded-full hover:text-white text-orange-950">Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
