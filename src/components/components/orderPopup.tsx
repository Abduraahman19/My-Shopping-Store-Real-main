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

    const [formData, setFormData] = useState(initialFormState);

    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart.items) || [];
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://countriesnow.space/api/v0.1/countries/flag/images");
                const data = await response.json();
                if (data && data.data) {
                    setCountries(data.data);
                }
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    // Open popup and reset form
    const openPopup = () => {
        setFormData(initialFormState);
        setStep(1);
        setOpen(true);
    };

    // Close popup: Empty cart only if order is confirmed (Step 4)
    const handleClose = () => {
        if (step === 4) {
            dispatch(cartReset()); // Empty cart on successful order
            localStorage.removeItem("cart"); // Clear localStorage
        }
        setOpen(false);
        setStep(1); // Reset step to the beginning
    };

    // Update form fields
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Confirm order and move to final step
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

            <Dialog
                open={open}
                onClose={handleClose} // Close on backdrop click
                maxWidth="sm"
                fullWidth
            >
                <div className="bg-[#FEEBF8] text-white pl-5 flex justify-between items-center">
                    <h2 className="text-5xl text-[#ADADAD] py-5">
                        {step === 1
                            ? "Order Summary"
                            : step === 2
                            ? "User Information"
                            : step === 3
                            ? "Shipping & Payment"
                            : "Order Confirmation"}
                    </h2>

                    <div
                        onClick={handleClose}
                        className="hover:bg-red-600 cursor-pointer transition duration-300 h-24 w-24 flex items-center justify-center"
                    >
                        <AiOutlineClose className="text-4xl" />
                    </div>
                </div>

                <DialogContent className="bg-gray-50 text-gray-800">
                    {/* Step 1: Order Summary */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-4xl mb-4">Your Cart Items:</h3>
                            {cart.map((item) => (
                                <p key={item.id} className="text-2xl">
                                    {item.name} - {item.quantity} x ${item.price}
                                </p>
                            ))}
                            <h3 className="text-4xl mt-8">Total: Rs {totalAmount.toFixed(2)}</h3>
                        </div>
                    )}

                    {/* Step 2: User Information */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-4xl mb-4">Enter Your Information:</h3>
                            {Object.keys(initialFormState).slice(0, 6).map((field) => (
                                <TextField
                                    key={field}
                                    name={field}
                                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                                    fullWidth
                                    margin="normal"
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    style={{ fontWeight: "bold", fontSize: "1.5rem" }}
                                />
                            ))}
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Country</InputLabel>
                                <Select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                >
                                    {countries.map((country) => (
                                        <MenuItem key={country.name} value={country.name}>
                                            <img
                                                src={country.flag}
                                                alt={country.name}
                                                style={{ width: "30px", marginRight: "10px" }}
                                            />
                                            <div className="text-3xl font-extrabold">{country.name}</div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    )}

                    {/* Step 3: Shipping & Payment */}
                    {step === 3 && (
                        <div className="space-y-10">
                            <h3 className="text-4xl">Select Shipping and Payment Method:</h3>
                            <TextField
                                select
                                label="Shipping Method"
                                name="shippingMethod"
                                fullWidth
                                value={formData.shippingMethod}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="Standard">Standard</MenuItem>
                                <MenuItem value="Express">Express</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Payment Method"
                                name="paymentMethod"
                                fullWidth
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="Card">Card</MenuItem>
                                <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                            </TextField>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="text-center text-4xl font-bold text-green-600">
                            <p>Your order has been placed successfully! 🎉</p>
                            <p>Thank you for shopping with us.</p>
                        </div>
                    )}
                </DialogContent>

                <DialogActions className="bg-gray-100 px-5 py-3">
                    {/* Back Button (Step > 1 and < 4) */}
                    {step > 1 && step < 4 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-4xl py-4 bg-black rounded-full px-8 hover:text-orange-700 text-orange-600"
                        >
                            Back
                        </button>
                    )}

                    {/* Next/Confirm/Close Button */}
                    {step === 3 ? (
                        <button
                            onClick={confirmOrder}
                            className="text-4xl py-4 bg-black hover:text-orange-700 rounded-full px-8 text-orange-600"
                        >
                            Confirm
                        </button>
                    ) : step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="text-4xl py-4 bg-black rounded-full px-8 hover:text-orange-700 text-orange-600"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="text-4xl py-4 bg-black rounded-full px-8 text-orange-600 hover:text-orange-700"
                        >
                            Close
                        </button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default OrderPopup;
