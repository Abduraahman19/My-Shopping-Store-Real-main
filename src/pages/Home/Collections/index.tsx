import { useEffect, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  link: string;
  image: string;
}

const Collections = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="main-container py-12 md:py-32">
        <p className="font-bold text-3xl tracking-wide text-title leading-tight mb-2">
          Collections
        </p>
        <div className="py-10">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-7 md:grid-rows-2 md:gap-5">
            {categories.map((item, id) => {
              const gridClass = [
                "md:col-span-3 md:row-span-1 shadow-2xl rounded-3xl",
                "md:col-span-2 md:row-span-1 shadow-2xl rounded-3xl",
                "md:col-span-2 md:row-span-1 shadow-2xl rounded-3xl",
                "md:col-span-3 md:row-span-1 shadow-2xl rounded-3xl",
                "md:col-span-2 md:row-span-2 shadow-2xl rounded-3xl",
                "md:col-span-2 md:row-span-2 shadow-2xl rounded-3xl",
              ][id] || "";

              return (
                <Link key={item.id} to={item.link} className={`relative ${gridClass}`}>
                  <img
                    srcSet={item.image}
                    className="object-cover rounded-3xl shadow-2xl w-full h-full"
                    loading="lazy"
                    alt={item.name}
                  />
                  <motion.div
                    key="cart"
                    whileHover={{ scale: 1.2 }}
                    className="absolute bottom-0 right-0 m-5 w-24 h-24 flex items-center justify-center bg-orange-500 rounded-full"
                  >
                    <MdArrowOutward className="text-white text-5xl" />
                  </motion.div>
                  <div className="absolute bottom-0 bg-white/50 rounded-full px-4 py-2 left-0 m-5 text-lg md:text-4xl font-extrabold text-secondary">
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
