import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cartReset } from "../../features/cart/cartSlice";

const OrderPopup = () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [countries, setCountries] = useState([]);

    const initialFormState = {
        name: "",
        email: "",
        address: "",
        city: "",
        zip: "",
        phone: "",
        shippingMethod: "Standard",
        paymentMethod: "Card",
        country: "",
    };

    interface CartItem {
        product: {
            id: string;
            image: string;
            title: string;
            price: number;
        };
        quantity: number;
    }

    interface CartProps {
        cartItems: CartItem[];
        totalAmount: number;
    }

    const [formData, setFormData] = useState(initialFormState);

    const dispatch = useAppDispatch();
    const cartItems = useAppSelector((state) => state.cart.cartItems) || [];

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://countriesnow.space/api/v0.1/countries/flag/images");
                const data = await response.json();
                if (data?.data) {
                    setCountries(data.data);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    const openPopup = () => {
        setFormData(initialFormState);
        setStep(1);
        setOpen(true);
    };

    const handleClose = () => {
        if (step === 4) {
            dispatch(cartReset());
            localStorage.removeItem("cart");
        }
        setOpen(false);
        setStep(1);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const confirmOrder = () => {
        setStep(4);
    };

    return (
        <div>
            <button
                onClick={openPopup}
                className="bg-orange-600 py-5 px-28 rounded-full hover:text-white text-[#b4b2b2]"
            >
                Place Order
            </button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <div className="bg-[#FEEBF8] text-white pl-5 flex justify-between items-center">
                    <h2 className="text-5xl text-[#ADADAD] py-5">
                        {step === 1 ? "Order Summary" : step === 2 ? "User Information" : step === 3 ? "Shipping & Payment" : "Order Confirmation"}
                    </h2>
                    <div onClick={handleClose} className="hover:bg-red-600 cursor-pointer transition duration-300 h-24 w-24 flex items-center justify-center">
                        <AiOutlineClose className="text-4xl" />
                    </div>
                </div>

                <DialogContent className="bg-gray-50 text-gray-800">
                    {step === 1 && (
                        <div className="p-8 bg-gray-50 rounded-xl shadow-xl">
                            <h2 className="text-5xl font-bold mb-8">Your Cart</h2>

                            {cartItems.length === 0 ? (
                                <p className="text-3xl text-gray-600">Your cart is empty.</p>
                            ) : (
                                <>
                                    {cartItems.map((item, index) => (
                                        <div
                                            key={item.product.id}
                                            className="flex items-center gap-6 mb-6 p-6 border rounded-lg shadow-md bg-white"
                                        >
                                            <span className="text-3xl font-semibold">{index + 1}.</span>
                                            <img
                                                src={item.product.image}
                                                alt={item.product.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />

                                            <div className="flex-1">
                                                <p className="text-3xl font-semibold mb-2">{item.product.title}</p>
                                                <p className="text-2xl text-gray-700">Quantity: {item.quantity}</p>
                                                <p className="text-2xl text-gray-700">Price: Rs    Rs. {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(item.product.price)}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                                    Subtotal: Rs {(item.quantity * item.product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-12 border-t pt-8">
                                        <h3 className="text-4xl font-extrabold mb-6">Total Amount:</h3>
                                        <p className="text-5xl text-green-600 font-bold">
                                            Rs. {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(totalAmount)}
                                        </p>
                                    </div>

                                    <div className="mt-12">
                                        <h4 className="text-4xl font-bold mb-4">Cart Summary:</h4>
                                        <ul className="list-disc ml-8 space-y-4">
                                            {cartItems.map((item, index) => (
                                                <li key={item.product.id} className="text-2xl text-gray-800">
                                                    <strong>Product {index + 1}:</strong> {item.product.title} - {item.quantity} pcs @ Rs {item.product.price.toFixed(2)} each
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h3 className="text-5xl mb-6">Enter Your Information:</h3>

                            {Object.keys(initialFormState).slice(0, 6).map((field) => (
                                <TextField
                                    key={field}
                                    name={field}
                                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                                    fullWidth
                                    margin="normal"
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        style: { fontSize: "1.7rem", fontWeight: "unset" },
                                    }}
                                    InputLabelProps={{
                                        style: { fontSize: "1.7rem" },
                                    }}
                                />
                            ))}

                            <FormControl fullWidth margin="normal">
                                <InputLabel style={{ fontSize: "1.5rem" }}>Country</InputLabel>
                                <Select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    style={{ fontSize: "1.7rem", fontWeight: "unset" }}
                                >
                                    {countries.map((country) => (
                                        <MenuItem key={country.name} value={country.name} style={{ fontSize: "1.8rem", fontWeight: "unset" }}>
                                            <img
                                                src={country.flag}
                                                alt={country.name}
                                                style={{ width: "35px", marginRight: "15px" }}
                                            />
                                            {country.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-10">
                            <h3 className="text-5xl mb-6">Select Shipping and Payment Method:</h3>

                            <TextField
                                select
                                label="Shipping Method"
                                name="shippingMethod"
                                fullWidth
                                value={formData.shippingMethod}
                                onChange={handleInputChange}
                                InputProps={{
                                    style: { fontSize: "1.5rem" },
                                }}
                                InputLabelProps={{
                                    style: { fontSize: "1.5rem" },
                                }}
                            >
                                <MenuItem value="Standard" style={{ fontSize: "1.5rem" }}>Standard</MenuItem>
                                <MenuItem value="Express" style={{ fontSize: "1.5rem" }}>Express</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Payment Method"
                                name="paymentMethod"
                                fullWidth
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                InputProps={{
                                    style: { fontSize: "1.5rem" },
                                }}
                                InputLabelProps={{
                                    style: { fontSize: "1.5rem" },
                                }}
                            >
                                <MenuItem value="Card" style={{ fontSize: "1.5rem" }}>Card</MenuItem>
                                <MenuItem value="Cash on Delivery" style={{ fontSize: "1.5rem" }}>Cash on Delivery</MenuItem>
                            </TextField>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center text-center p-8">
                            <h3 className="text-6xl font-extrabold text-green-600 mb-6">Order Confirmed! 🎉</h3>
                            <p className="text-2xl text-gray-700 mb-4">Thank you for your purchase. Your order has been successfully placed.</p>
                            <p className="text-xl text-gray-500">We'll notify you once your items are on the way.</p>
                        </div>
                    )}
                </DialogContent>

                <DialogActions className="bg-gray-100 px-5 py-3">
                    {step > 1 && step < 4 && (
                        <button onClick={() => setStep(step - 1)} className="text-4xl bg-black text-orange-600 rounded-full py-4 px-8">Back</button>
                    )}
                    {step < 3 ? (
                        <button onClick={() => setStep(step + 1)} className="text-4xl py-4 bg-black text-orange-600 rounded-full px-8">Next</button>
                    ) : step === 3 ? (
                        <button onClick={confirmOrder} className="text-4xl py-4 bg-black text-orange-600 rounded-full px-8">Confirm</button>
                    ) : (
                        <button onClick={handleClose} className="text-4xl bg-black text-orange-600 rounded-full py-4 px-8">Close</button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default OrderPopup;
