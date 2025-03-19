import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { sizeData } from "../../data/navItems";
import GoToTop from "../../components/components/GoToTop";
import Spinner from "../../components/components/Spinner";
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
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Replace Redux with direct API call
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
        
        // Find the product that matches the id from params
        const foundProduct = data.find((item: ProductType) => item._id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // If no product found, redirect to catalog
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

  const addToCartHandler = () => {
    if (!id || !product) return;

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

    // Implement your cart logic here without Redux
    // For example, you could use context or local storage
    // For now, just simulating the loading state
    setTimeout(() => {
      setIsLoadingProduct(false);
      // Add your cart logic here
    }, 1000);
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
        <p className="text-sm text-gray-600 mb-4">
          {route.map((item, index) => (
            <Link to={item.route} key={index}>
              {item.name}
              {index < 2 && <span>&nbsp;&gt;&nbsp;</span>}
            </Link>
          ))}
        </p>

        {product && (
          <div className="flex flex-col md:flex-row gap-20 justify-around mt-20">
            <div className="flex justify-center">
              <img
                src={product.image}
                className="max-w-[50rem] max-h-[50rem] object-contain bg-gray-100 rounded-2xl p-8"
                alt={product.name}
              />
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold uppercase text-gray-800">
                  {product.name}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  {product.description}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-700 mb-2">Size:</h2>
                <div className="flex gap-2 flex-wrap">
                  {sizeData?.map((item) => (
                    <label
                      key={item}
                      className="cursor-pointer border border-gray-300 px-4 py-2 rounded-full text-sm"
                    >
                      <input
                        type="radio"
                        name="size"
                        value={item}
                        className="hidden"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-700 mb-2">Price:</h2>
                <p className="text-2xl font-bold text-gray-800">
                  ${product.price}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addToCartHandler}
                  className="bg-gray-800 text-white px-6 py-3 rounded-full"
                  disabled={isLoadingProduct}
                >
                  {isLoadingProduct ? <Spinner className="w-5 h-5" /> : "Add to Cart"}
                </button>
                <Link
                  to="/catalog/All"
                  className="bg-[#EA580C] text-white px-6 py-3 rounded-full"
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