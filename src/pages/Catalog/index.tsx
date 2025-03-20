import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import ProductCard from "../../components/components/ProductCard";
import Spinner from "../../components/components/Spinner";
import GoToTop from "../../components/components/GoToTop";
import Button from "../../components/components/Button";

interface Product {
  id: number;
  _id: string;  
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

const Catalog = () => {
  let { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data: Product[] = await response.json();

        if (id && id !== "All") {
          const filteredProducts = data.filter(
            (product) => product.category.toLowerCase() === id!.toLowerCase()
          );
          setProducts(filteredProducts);
        } else {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!id) {
      const newUrl = `${window.location.pathname}/All`;
      window.history.pushState({ path: newUrl }, "", newUrl);
      id = "All";
    }

    fetchProducts();
  }, [id]);

  const convertedString = id
    ?.split("-")
    ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1))
    ?.join(" ");

  if (isLoading) return <Spinner />;

  return (
    <div className="main-container py-32 md:py-40">
      <div className="flex gap-4">
        <Button className="flex items-center justify-center bg-transparent" onClick={() => navigate(-1)}>
          <MdArrowBack className="text-2xl font-extrabold mt-1 text-orange-600 md:text-6xl text-title" />
        </Button>
        <div className="flex text-orange-600 items-center text-2xl tracking-wide text-title md:justify-center md:text-6xl">
          {convertedString}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 justify-center items-center py-10 md:grid-cols-4 md:gap-16 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product._id}
            title={product.name}
            price={product.price}
            description={product.description}
            image={product.image}
          />
        ))}
      </div>

      <GoToTop />
    </div>
  );
};

export default Catalog;