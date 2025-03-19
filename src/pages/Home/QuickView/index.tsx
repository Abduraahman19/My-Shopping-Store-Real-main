import { useState, useEffect } from "react";
import styles from "./index.module.scss";
import ProductCard from "../../../components/components/ProductCard";
import { MdArrowRightAlt } from "react-icons/md";
import { Link } from "react-router-dom";
import { navData } from "../../../data/navItems";

interface Product {
  id: number;
  _id: string;
  name: string; // Changed from title to name
  price: number;
  category: string;
  description: string;
  image: string;
}

const QuickView = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  console.log("🚀 ~ QuickView ~ filteredProducts:", filteredProducts)
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data); // Initialize filteredProducts with all products
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategory = (category: string) => {
    setSelectedCategory(category);

    if (category === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <section className={styles.section}>
      <div className={`${styles.container} main-container`}>
        <p className={styles.section_title_top}>Quick View</p>

        <div className={styles.categories}>
          <div className={styles.buttonContainer}>
            {navData.map((item) => (
              <div className={styles.button} key={item.name}>
                <input
                  type="radio"
                  id={item.name}
                  name="category"
                  value={item.value}
                  onChange={() => handleCategory(item.value)}
                  checked={selectedCategory === item.value}
                />
                <label htmlFor={item.name}>{item.name}</label>
              </div>
            ))}
          </div>

          <Link
            to={`/catalog/${String(selectedCategory)}`}
            className={styles.viewAllContainer}
          >
            <div className={styles.viewMore}>View More</div>
            <MdArrowRightAlt className={styles.icon} />
          </Link>
        </div>

        <div className={styles.productList}>
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              id={product._id}
              title={product.name} // Changed
              price={product.price}
              description={product.description}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickView;