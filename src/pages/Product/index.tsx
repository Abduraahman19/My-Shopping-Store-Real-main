import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GoToTop from "../../components/components/GoToTop";
import CircularProgress from "@mui/material/CircularProgress";
import Spinner from "../../components/components/Spinner";
import { useAppDispatch } from "../../app/hooks";
import { incrementItemFromCart } from "../../features/cart/cartSlice";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import type { Cart } from "../../types/cart";

interface ProductType {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const Product = () => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!id) {
      navigate("/catalog/All");
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();

        const foundProduct = data.find((item: ProductType) => item._id === id);

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          navigate("/catalog/All");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const saveToLocalStorage = (cartItem: Cart) => {
    const existingCart = localStorage.getItem("cart");
    const cart: Cart[] = existingCart ? JSON.parse(existingCart) : [];

    const existingProductIndex = cart.findIndex(
      (item) => item.product.id === cartItem.product.id
    );

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += cartItem.quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const addToCartHandler = () => {
    if (!id || !product) return;

    console.log("Adding product to cart:", product);

    setIsLoadingProduct(true);

    const cartProduct: Cart = {
      quantity: 1,
      product: {
        id: product._id,
        title: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
      },
    };

    dispatch(incrementItemFromCart(cartProduct.product));

    setTimeout(() => {
      saveToLocalStorage(cartProduct);
      setIsLoadingProduct(false);
    }, 1500);
  };

  const route = [
    { name: "Home", route: "/" },
    { name: "Products", route: "/catalog/All" },
    { name: "Product Details", route: `/products/${id}` },
  ];

  if (isLoading) return <Spinner />;

  return (
    <section className="overflow-hidden !top-0">
      <div className="container mx-auto px-4 pt-32 pb-6 md:pb-10 md:pt-32">
        <p className="text-3xl 2xl:pl-40 text-orange-600 mb-4">
          {route.map((item, index) => (
            <Link to={item.route} key={index}>
              {item.name}
              {index < 2 && <span className="text-gray-600">&nbsp;&gt;&nbsp;</span>}
            </Link>
          ))}
        </p>

        {product && (
          <div className="flex flex-col md:flex-row gap-20  justify-center items-center mt-20">
            <img
              src={product.image}
              className="max-w-[350px] max-h-[350px] rounded-3xl cursor-pointer"
              alt={product.name}
              onClick={() => setIsImageOpen(true)}
            />

            <AnimatePresence>
              {isImageOpen && (
                <div className="fixed inset-0 p-20 bg-white/40 backdrop-blur-lg flex justify-center items-center z-50">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-full rounded-3xl"
                  />
                  <IconButton
                    onClick={() => setIsImageOpen(false)}
                    sx={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      ":hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 30, color: "white" }} />
                  </IconButton>
                </div>
              )}
            </AnimatePresence>

            <div className="flex flex-col max-w-[600px] mt-10 gap-8">
              <h1 className="text-4xl md:text-6xl uppercase text-gray-800">
                {product.name}
              </h1>
              <p className="text-2xl md:text-4xl font-extrabold text-gray-600 mt-2">
                {product.description}
              </p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl text-gray-700">Price:</h2>
                <p className="text-3xl font-extrabold text-gray-800">
                  Rs {product.price}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addToCartHandler}
                  className="bg-gray-800 text-white text-3xl font-extrabold px-6 py-3 rounded-full"
                  style={{ width: 150, height: 50 }}
                >
                  {isLoadingProduct ? <CircularProgress size={35} /> : "Add to Cart"}
                </button>
                <Link
                  to="/catalog/All"
                  className="bg-[#EA580C] text-3xl text-white px-6 py-3 rounded-full flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <GoToTop />
    </section>
  );
};

export default Product;
