import { MdArrowOutward } from "react-icons/md";
import { Link } from "react-router-dom";
import { collectionImages } from "../../../data/images";
import { motion } from "framer-motion";

const Collections = () => {
  return (
    <section className="overflow-hidden">
      <div className="main-container py-12 md:py-32">
        <p className="font-bold text-3xl tracking-wide text-title leading-tight mb-2">Collections</p>
        <div className="py-10">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-7 md:grid-rows-2 md:gap-5">
            {collectionImages.map((item, id) => {
              const gridClass = [
                "md:col-span-3 md:row-span-1",
                "md:col-span-2 md:row-span-1",
                "md:col-span-2 md:row-span-1",
                "md:col-span-3 md:row-span-1",
                "md:col-span-2 md:row-span-2",
              ][id] || "";

              return (
                <Link key={id} to={item.link} className={`relative ${gridClass}`}>
                  <img
                    srcSet={item.path}
                    className="object-cover rounded-3xl w-full h-full"
                    loading="lazy"
                    alt={item.name}
                  />
                  <motion.div
                    key="cart"
                    whileHover={{ scale: 2 }}
                    className="absolute bottom-0 right-0 m-2 w-24 h-24 flex items-center justify-center bg-orange-500 rounded-full"
                  >
                    <MdArrowOutward className="text-white  text-5xl" />
                  </motion.div>
                  <div className="absolute bottom-0 left-0 m-2 text-lg md:text-4xl font-normal text-secondary">
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
