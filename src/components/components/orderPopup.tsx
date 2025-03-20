import { useState } from "react";
import { Button, Dialog, DialogContent, DialogActions } from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { useAppDispatch } from "../../app/hooks";
import { cartReset } from "../../features/cart/cartSlice";

const OrderPopup = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch();

    const handleClose = () => {
        dispatch(cartReset());                   // Clear Redux cart
        localStorage.removeItem("cart");         // Clear local storage
        console.log("Cart cleared!");            // Debug log
        setOpen(false);                          // Close dialog
    };

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className='bg-orange-600 py-5 px-28 rounded-full hover:text-white text-[#b4b2b2]'>
                Place Order
            </button>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                className="rounded-lg"
            >
                <div className="bg-[#FEEBF8] text-white pl-5 flex justify-between items-center">
                    <h2 className="text-5xl text-[#ADADAD] py-5">Order Confirmation</h2>
                    <div onClick={handleClose} className="hover:bg-red-600 cursor-pointer transition duration-300 h-24 w-24 flex items-center hover:text-white text-[#777676] justify-center">
                        <AiOutlineClose className="text-4xl" />
                    </div>
                </div>

                <DialogContent className="bg-gray-50 text-gray-800">
                    <p className="text-3xl font-extrabold">Thank you for your order! 🎉 Your package is on its way and will reach you soon. We appreciate your trust in us!</p>
                </DialogContent>

                <DialogActions className="bg-gray-100 px-5 py-3">
                    <button
                        onClick={handleClose}
                        color="error"
                        className="px-8 py-4 text-3xl text-white shadow-md bg-red-500 hover:bg-red-700 rounded-xl hover:text-gray-200 transition"
                    >
                        Close
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default OrderPopup;
