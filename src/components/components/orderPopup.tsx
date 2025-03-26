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
                    <h2 className="text-5xl text-[#9b9b9b] py-5">
                        {step === 1 ? "Order Summary" : step === 2 ? "User Information" : step === 3 ? "Shipping & Payment" : "Order Confirmation"}
                    </h2>
                    <div onClick={handleClose} className="hover:bg-red-600 cursor-pointer text-black hover:text-white transition duration-300 h-24 w-24 flex items-center justify-center">
                        <AiOutlineClose className="text-4xl" />
                    </div>
                </div>

                <DialogContent className="bg-gray-200 text-gray-800">
                    {step === 1 && (
                        <div className="p-8 bg-neutral-100 rounded-3xl shadow-xl">
                            <h2 className="text-5xl bg-orange-600/25 px-7 py-2 rounded-full w-72 text-orange-600 mb-8">Your Cart</h2>

                            {cartItems.length === 0 ? (
                                <p className="text-3xl text-gray-600">Your cart is empty.</p>
                            ) : (
                                <>
                                    {cartItems.map((item, index) => (
                                        <div
                                            key={item.product.id}
                                            className="flex items-center gap-6 mb-6 p-6 border rounded-xl shadow-md bg-white"
                                        >
                                            <span className="text-3xl mr-[-8px] bg-black/20 inline-flex items-center justify-center w-12 aspect-square rounded-full text-black">
                                                {index + 1}
                                            </span>
                                            <img
                                                src={item.product.image}
                                                alt={item.product.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />

                                            <div className="flex-1">
                                                <p className="text-3xl font-semibold mb-2">{item.product.title}</p>
                                                <p className="text-2xl text-gray-700">Quantity: {item.quantity}</p>
                                                <p className="text-2xl text-gray-700">Price: Rs. {new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(item.product.price)}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                                    Subtotal: Rs. {(item.quantity * item.product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-12 border-t pt-8">
                                        <h3 className="text-4xl mb-6">Total Amount:</h3>
                                        <p className="text-5xl text-green-600 px-5 py-2 bg-green-600/30 rounded-full w-96">
                                            Rs. {new Intl.NumberFormat("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(totalAmount)}
                                        </p>
                                    </div>

                                    <div className="mt-12">
                                        <h4 className="text-4xl text-gray-600 mb-4">Cart Summary:</h4>
                                        <ul className="list-disc ml-8 space-y-4">
                                            {cartItems.map((item, index) => (
                                                <li key={item.product.id} className="text-2xl text-neutral-600">
                                                    <strong className="text-neutral-900">Product {index + 1}:</strong> {item.product.title} - {item.quantity} pcs @ Rs {item.product.price.toFixed(2)} each
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-neutral-100 p-8 rounded-3xl shadow-xl">
                            <h3 className="text-5xl mb-6 bg-orange-600/25 px-7 py-2 rounded-full w-[340px] text-orange-600">Enter Your Information:</h3>
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
                                        style: { fontSize: "1.7rem", fontWeight: "unset", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" },
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
                                    style={{ fontSize: "1.7rem", fontWeight: "unset", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}
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
                        <div className="space-y-12 bg-neutral-100 p-8 rounded-3xl shadow-xl">
                            {/* Section Title */}
                            <h3 className="text-5xl bg-orange-600/25 p-4 rounded-full text-orange-600 mb-8">Select Shipping and Payment Method:</h3>

                            {/* Shipping Method */}
                            <div className="space-y-6">
                                <h4 className="text-3xl mb-2 bg-gray-600/25 w-[170px] px-7 py-2 rounded-full text-gray-600">Shipping Method</h4>

                                <TextField
                                    select
                                    label="Choose Shipping Method"
                                    name="shippingMethod"
                                    fullWidth
                                    value={formData.shippingMethod}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        style: {
                                            fontSize: "1.5rem",
                                            borderRadius: "12px",
                                            padding: "10px 20px",
                                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                    InputLabelProps={{
                                        style: { fontSize: "1.4rem" },
                                    }}
                                    SelectProps={{
                                        renderValue: (selected) => {
                                            const shippingOptions: Record<string, string> = {
                                                "Standard": "Free",
                                                "Express": "Rs 500",
                                                "Laperds": "Rs 400",
                                                "TCS Overnight": "Rs 330",
                                                "TCS Same Day": "Rs 90",
                                                "M&P Same Day": "Rs 300",
                                                "M&P Overnight": "Rs 245",
                                                "Pakistan Post": "Rs 150",
                                                "DCS Karachi": "Rs 140",
                                                "Barqraftar Local": "Rs 150",
                                            };
                                            return (
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>{selected}</span>
                                                    <span className="text-gray-500">{shippingOptions[selected] || "Varies"}</span>
                                                </div>
                                            );
                                        },
                                    }}
                                >
                                    {[
                                        { value: "Standard", label: "Standard", price: "Free" },
                                        { value: "Express", label: "Express", price: "Rs 500" },
                                        { value: "TCS Overnight", label: "TCS Overnight", price: "Rs 330" },
                                        { value: "TCS Same Day", label: "TCS Same Day", price: "Rs 90" },
                                        { value: "M&P Same Day", label: "M&P Same Day", price: "Rs 300" },
                                        { value: "M&P Overnight", label: "M&P Overnight", price: "Rs 245" },
                                        { value: "Laperds", label: "Laperds", price: "Rs 400" },
                                        { value: "Pakistan Post", label: "Pakistan Post", price: "Rs 150" },
                                        { value: "DCS Karachi", label: "DCS Karachi", price: "Rs 140" },
                                        { value: "Barqraftar Local", label: "Barqraftar Local", price: "Rs 150" },
                                    ].map((item) => (
                                        <MenuItem
                                            key={item.value}
                                            value={item.value}
                                            style={{
                                                fontSize: "1.5rem",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            <span>{item.label}</span>
                                            <span>({item.price})</span>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-6">
                                <h4 className="text-3xl mb-2 bg-gray-600/25 w-[160px] px-5 py-2 rounded-full text-gray-600">Payment Method</h4>

                                <TextField
                                    select
                                    label="Choose Payment Method"
                                    name="paymentMethod"
                                    fullWidth
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        style: {
                                            fontSize: "1.5rem",
                                            borderRadius: "12px",
                                            padding: "10px 20px",
                                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                    InputLabelProps={{
                                        style: { fontSize: "1.4rem" },
                                    }}
                                    SelectProps={{
                                        renderValue: (selected) => {
                                            const paymentDetails: Record<string, string> = {
                                                "Credit Card": "(Visa / MasterCard)",
                                                "Debit Card": "(ATM / Visa Debit)",
                                                "Easypaisa": "(Mobile Wallet)",
                                                "Jazz Cash": "(Mobile Wallet)",
                                                "Bank Account Transfer": "(Account No Transfer)",
                                                "Bank Transfer": "(Bank-to-Bank)",
                                                "Cash on Delivery": "(Pay on Arrival)",
                                            };

                                            return (
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>{selected}</span>
                                                    <span className="text-gray-500">{paymentDetails[selected] || ""}</span>
                                                </div>
                                            );
                                        },
                                    }}
                                >
                                    {[
                                        { value: "Credit Card", label: "Credit Card", detail: "Visa / MasterCard" },
                                        { value: "Debit Card", label: "Debit Card", detail: "ATM / Visa Debit" },
                                        { value: "Easypaisa", label: "Easypaisa", detail: "Mobile Wallet" },
                                        { value: "Jazz Cash", label: "Jazz Cash", detail: "Mobile Wallet" },
                                        {
                                            value: "Bank Account Transfer",
                                            label: "Bank Account Transfer",
                                            detail: "Account No Transfer",
                                        },
                                        {
                                            value: "Bank Transfer",
                                            label: "Bank Transfer",
                                            detail: "Bank-to-Bank",
                                        },
                                        {
                                            value: "Cash on Delivery",
                                            label: "Cash on Delivery",
                                            detail: "Pay on Arrival",
                                        },
                                    ].map((item) => (
                                        <MenuItem
                                            key={item.value}
                                            value={item.value}
                                            style={{
                                                fontSize: "1.5rem",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "15px 20px",
                                            }}
                                        >
                                            <span>{item.label}</span>
                                            <span>({item.detail})</span>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col bg-neutral-100 rounded-3xl items-center justify-center text-center p-10">
                            <h3 className="text-6xl font-extrabold text-green-600 mb-8 animate-bounce">Order Confirmed! 🎉</h3>
                            <p className="text-2xl text-gray-800 mb-6">Thank you for your order! We have successfully received your purchase.</p>
                            <p className="text-xl text-gray-600 mb-4">A confirmation email has been sent to your inbox with all the details.</p>
                            <p className="text-lg text-gray-500">We will notify you as soon as your items are shipped. Stay tuned!</p>
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
