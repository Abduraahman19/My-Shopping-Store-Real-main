import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiSearch2Line, RiUserLine } from "react-icons/ri";
import axios from "axios";
import CartIcon from "./CartIcon";
import { navData } from "../../../../../data/navItems";

interface NavbarProps {
  handleShow: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleShow }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; image: string; name: string }[]>([]);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async () => {
    try {
      if (searchQuery.trim()) {
        const response = await axios.get(
          `http://localhost:5000/api/products?search=${searchQuery}`
        );

        const filteredResults = response.data.filter((product: { name: string }) =>
          typeof product.name === "string" &&
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setIsSearchBarVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const toggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleProductClick = (id: string) => {
    navigate(`/products/${id}`);
    setIsSearchBarVisible(false); // Hide search bar after navigation
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchBarVisible(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`fixed left-1/2 transform -translate-x-1/2 w-[98%] mt-2 mb-2 md:w-[90%] z-50 transition-all ${hasScrolled ? "bg-white shadow-md rounded-2xl" : "bg-transparent"}`}>
      <div className="flex items-center justify-between px-8 py-2">
        <Link to="/" className="text-5xl text-gray-800">My Shopping Store</Link>

        <ul className="hidden md:flex space-x-8">
          {navData.map((option) => (
            <li key={option.name}>
              <NavLink to={`/catalog/${option.name}`} className="text-gray-600 font-extrabold text-3xl hover:text-gray-900 transition">
                {option.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-4 md:gap-10">
          <li>
            <button onClick={toggleSearchBar} className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-200">
              <RiSearch2Line size={24} />
            </button>
          </li>
          <li>
            <div className="cursor-pointer text-4xl text-gray-600" onClick={handleShow}>
              <CartIcon />
            </div>
          </li>
          <li>
            <NavLink to="/login" className='text-gray-600 hover:text-gray-900 p-2'>
              <RiUserLine size={24} />
            </NavLink>
          </li>
        </ul>
      </div>

      {isSearchBarVisible && (
        <div ref={searchBarRef} className="relative rounded-b-2xl bg-white py-4 px-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full h-20 px-4 rounded-2xl border text-4xl font-medium border-gray-300 focus:outline-none"
          />

          {searchResults.length > 0 ? (
            <div className="absolute left-0 right-0 bg-white shadow-lg max-h-96 overflow-y-auto mt-2 border border-gray-200 rounded-b-2xl">
              {searchResults.map((product) => (
                <motion.div
                  key={product.id}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <span className="text-gray-800 text-3xl font-extrabold">{product.name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            searchQuery && <div className="text-center text-gray-500 mt-2">No results found</div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
