import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Select, MenuItem, Paper, TextField } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:8080/api";
const getToken = () => localStorage.getItem("token");

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);

    useEffect(() => {
        fetchCart();
        fetchCoupons();
    }, []);

    const fetchCart = async () => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await axios.get(`${API_BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            const userCart = response.data.data.find(cart => cart.userId._id === userId);

            if (userCart) {
                setCart(userCart);
                setTotalPrice(userCart.totalPrice);
                setFinalPrice(userCart.totalPrice);
                setDiscountAmount(0);
            } else {
                toast.error("Cart is empty!");
                navigate("/user");
            }
        } catch (error) {
            toast.error("Failed to fetch cart!");
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/coupon/list`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setCoupons(response.data.data);
        } catch (error) {
            toast.error("Failed to load coupons!");
        }
    };
    const updateQuantity = async (productId, change) => {
        if (!cart || !cart._id) {
            toast.error("Cart not found!");
            return;
        }
    
        const updatedCart = { ...cart };
        const productIndex = updatedCart.products.findIndex(p => p.productId._id === productId);
    
        if (productIndex !== -1) {
            const currentQuantity = updatedCart.products[productIndex].quantity;
            const newQuantity = currentQuantity + change;
    
            if (newQuantity <= 0) {
                removeProduct(productId); // Remove the product if quantity is zero
                return;
            }
    
            try {
                const response = await axios.put(
                    `${API_BASE_URL}/cart/${cart._id}/product/${productId}`,
                    { quantity: newQuantity },
                    { headers: { Authorization: `Bearer ${getToken()}` } }
                );
    
                if (response.data.success) {
                    toast.success("Quantity updated!");
                    fetchCart(); // Refresh cart after updating quantity
                } else {
                    toast.error(response.data.message || "Failed to update quantity!");
                }
            } catch (error) {
                toast.error("Failed to update quantity!");
            }
        }
    };
    
    const removeProduct = async (productId) => {
        if (!cart || !cart._id) {
            toast.error("Cart not found!");
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/cart/${cart._id}/product/${productId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (response.data.success) {
                toast.success("Product removed from cart!");
                fetchCart(); // Refresh cart after removing item
            } else {
                toast.error(response.data.message || "Something went wrong!");
            }
        } catch (error) {
            toast.error("Failed to remove product!");
        }
    };

    const applyCoupon = async () => {
        if (!selectedCoupon) {
            toast.error("Please select a valid coupon!");
            return;
        }

        if (!cart || !cart._id) {
            toast.error("Cart not found!");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/cart/${cart._id}/coupon`,
                { couponCode: selectedCoupon.code },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            const responseData = response.data;

            if (responseData.success) {
                toast.success("Coupon Applied Successfully!");

                const discount = responseData.data.cart.discountPrice;
                const newFinalPrice = responseData.data.cart.finalPrice;

                setDiscountAmount(discount);
                setFinalPrice(newFinalPrice);
            } else {
                toast.error(responseData.message || "Something went wrong");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to apply coupon!");
        }
    };

    return (
        <Container maxWidth="md" style={{ marginTop: "50px" }}>
            <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>Checkout</Typography>

                {cart && cart.products.length > 0 ? (
                    cart.products.map((item) => (
                        <div key={item.productId._id} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "15px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "8px"
                        }}>
                            <img
                                src={item.productId.image}
                                alt={item.productId.name}
                                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }}
                            />

                            <Typography style={{ flex: 1, marginLeft: "10px", fontSize: "16px", fontWeight: "bold" }}>
                                {item.productId.name} - ₹{item.productId.price}
                            </Typography>
                            <div>
                                <Button onClick={() => updateQuantity(item.productId._id, -1)} size="small" style={{ marginRight: "5px" }}>
                                    <FontAwesomeIcon icon={faMinus} />
                                </Button>

                                <span style={{ fontSize: "16px", fontWeight: "bold", margin: "0 8px" }}>
                                    {item.quantity}
                                </span>

                                <Button onClick={() => updateQuantity(item.productId._id, 1)} size="small" style={{ marginLeft: "5px" }}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </div>

                            <Button onClick={() => removeProduct(item.productId._id)} color="secondary">
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    ))
                ) : (
                    <Typography>No items in cart</Typography>
                )}

                <Typography variant="h6" style={{ marginTop: "20px" }}>
                    Total Price: <b>₹{totalPrice}</b>
                </Typography>

                {discountAmount > 0 && (
                    <>
                        <Typography variant="h6" color="green" style={{ marginTop: "10px" }}>
                            Discount Applied: <b>- ₹{discountAmount}</b>
                        </Typography>
                        <Typography variant="h6" color="blue" style={{ marginTop: "10px" }}>
                            You are saving <b>₹{discountAmount}</b> 🎉
                        </Typography>
                        <Typography variant="h6" style={{ marginTop: "10px", color: "#ff5722" }}>
                            Final Price: <b>₹{finalPrice}</b>
                        </Typography>
                    </>
                )}

                <Select
                    value={selectedCoupon ? selectedCoupon._id : ""}
                    onChange={(e) => {
                        const selected = coupons.find(coupon => coupon._id === e.target.value);
                        setSelectedCoupon(selected);
                    }}
                    displayEmpty
                    fullWidth
                    style={{ marginTop: "20px" }}
                >
                    <MenuItem value="" disabled>Select a Coupon</MenuItem>
                    {coupons.map(coupon => (
                        <MenuItem key={coupon._id} value={coupon._id}>
                            {coupon.code} - {coupon.discount}%
                        </MenuItem>
                    ))}
                </Select>

                <Button variant="contained" color="primary" style={{ marginTop: "20px" }} onClick={applyCoupon}>
                    Apply Coupon
                </Button>

                <Button variant="contained" color="secondary" style={{ marginTop: "20px" }} onClick={() => navigate("/payment")}>
                    Proceed to Payment
                </Button>
            </Paper>
        </Container>
    );
};

export default CheckoutPage;
