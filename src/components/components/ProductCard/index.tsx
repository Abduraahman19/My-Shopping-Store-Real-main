import { useState, FC } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../../types/product";
import { motion } from "framer-motion";
import { useAppDispatch } from "../../../app/hooks";
import { CartItem } from "../../../types/cart";
import { addToCart } from "../../../features/cart/cartSlice";
import { CgShoppingBag } from "react-icons/cg";
import Spinner from "../Spinner";

interface ProductCardProps extends Product {
  key: number;
}

const ProductCard: FC<ProductCardProps> = ({
  id,
  key,
  title,
  price,
  description,
  image,
}) => {
  const dispatch = useAppDispatch();

  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const saveToLocalStorage = (cartItem: CartItem) => {
    const existingCart = localStorage.getItem("cart");
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    // Check if product already exists and update quantity
    const existingProductIndex = cart.findIndex(item => item.product.id === cartItem.product.id);

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += cartItem.quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const addToCartHandler = () => {
    setIsLoadingProduct(true);

    const cartProduct: CartItem = {
      quantity: 1,
      product: {
        id: id,
        title: title,
        price: price,
        image: image,
        description: description,
      },
    };

    dispatch(addToCart(cartProduct)).then(() => {
      saveToLocalStorage(cartProduct);
      setIsLoadingProduct(false);
    });
  };

  return (
    <motion.div
      id={title}
      key={key}
      tabIndex={id}
      whileHover={{ cursor: "pointer" }}
      whileTap={{ cursor: "grabbing" }}
      transition={{
        ease: "easeInOut",
        duration: 0.4,
      }}
      className="flex flex-wrap justify-between hover:text-orange-600"
    >
      <div className="w-full mb-2 flex flex-col justify-between rounded-lg">
        <div className="relative mb-2 overflow-hidden">
          <Link to={`/products/${String(id)}`}>
            <img
              src={image}
              alt={title}
              className="w-[500px] object-contain rounded-3xl"
            />
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center w-full">
        <Link
          to={`/products/${String(id)}`}
          className="max-w-xs hover:text-orange-600"
        >
          <h3 className="font-poppins font-bold text-3xl mb-1 leading-6 overflow-hidden overflow-ellipsis line-clamp-2">
            {title}
          </h3>
          <p className="font-poppins font-bold text-neutral-700 mb-1">Rs {price}</p>
        </Link>

        <motion.button
          key={key}
          whileHover={{ scale: 1.1 }}
          onClick={addToCartHandler}
          className="flex items-center justify-center min-w-24 h-24 rounded-full bg-orange-500 hover:bg-orange-600"
        >
          {isLoadingProduct && <Spinner className="absolute" />}
          <CgShoppingBag
            className={`text-4xl text-white ${isLoadingProduct ? "animate-spin" : ""}`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;