import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Container, Paper, Typography, TextField, Button, Grid, CircularProgress, Snackbar,
    FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import {
    Person as PersonIcon, Email as EmailIcon, AttachMoney as AttachMoneyIcon,
    LocalOffer as LocalOfferIcon
} from "@mui/icons-material";

const ClientRegistration = () => {
    const [client, setClient] = useState({ name: "", email: "", subscriptionType: "", couponCode: "" });
    const [subscriptions, setSubscriptions] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [finalPrice, setFinalPrice] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });

    // Fetch subscriptions from API (only 3 subscriptions)
    useEffect(() => {
        axios.get("http://localhost:8080/api/client/subscriptions")
            .then(res => setSubscriptions(res.data.data.slice(0, 3))) // Only take 3 subscriptions
            .catch(() => setError("Failed to load subscriptions."))
            .finally(() => setLoading(false));
    }, []);

    // Fetch available coupons from API
    useEffect(() => {
        axios.get("http://localhost:8080/api/client/coupons")
            .then(res => setCoupons(res.data.data || []))
            .catch(() => setError("Failed to load coupons."));
    }, []);

    // Handle form field changes
    const handleChange = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };

    // Apply Coupon Discount
    const applyCoupon = () => {
        if (!client.couponCode) {
            setSnackbar({ open: true, message: "Enter a coupon code first!" });
            return;
        }
    
        const coupon = coupons.find(c => c.code === client.couponCode);
        if (!coupon) {
            setSnackbar({ open: true, message: "Invalid Coupon Code!" });
            setFinalPrice(null);
            return;
        }
    
        const selectedSubscription = subscriptions.find(sub => sub._id === client.subscriptionId);
        if (!selectedSubscription) {
            setSnackbar({ open: true, message: "Please select a subscription first!" });
            return;
        }
    
        let discountAmount = 0;
        if (coupon.couponType === "Percentage") {
            discountAmount = (selectedSubscription.sellingPrice * coupon.couponValue) / 100;
        } else {
            discountAmount = coupon.couponValue;
        }
    
        const newFinalPrice = Math.max(0, selectedSubscription.sellingPrice - discountAmount);
        setFinalPrice(newFinalPrice);
    
        let discountValue = coupon.couponType === "Percentage"
            ? `${coupon.couponValue}% off`
            : `₹${coupon.couponValue} off`;
    
        setSnackbar({ open: true, message: `Coupon Applied: ${discountValue}, Final Price: ₹${newFinalPrice}` });
    };
    

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!client.name || !client.email || !client.subscriptionId) {
            setSnackbar({ open: true, message: "All fields are required!" });
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:8080/api/client/register", client);
            setSnackbar({ open: true, message: "Client Registered Successfully!" });
    
            // Set the final price from the response
            setFinalPrice(response.data.finalPrice || 0);
            
            setClient({ name: "", email: "", subscriptionId: "", couponCode: "" });
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || "Registration Failed!" });
        }
    };
    

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ padding: "30px", marginTop: "30px", borderRadius: "10px" }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Client Registration
                </Typography>

                {/* Snackbar for Notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    message={snackbar.message}
                    onClose={() => setSnackbar({ open: false, message: "" })}
                />

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    {/* Client Name */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item><PersonIcon color="primary" /></Grid>
                        <Grid item xs>
                            <TextField
                                fullWidth label="Client Name" name="name"
                                value={client.name} onChange={handleChange} required
                            />
                        </Grid>
                    </Grid>

                    <br />

                    {/* Client Email */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item><EmailIcon color="primary" /></Grid>
                        <Grid item xs>
                            <TextField
                                fullWidth type="email" label="Client Email" name="email"
                                value={client.email} onChange={handleChange} required
                            />
                        </Grid>
                    </Grid>

                    <br />

                    {/* Subscription Type Dropdown */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item><AttachMoneyIcon color="primary" /></Grid>
                        <Grid item xs>
                            <FormControl fullWidth required>
                                <InputLabel>Subscription Type</InputLabel>
                                <Select
                                    name="subscriptionId"
                                    value={client.subscriptionId}
                                    onChange={handleChange}
                                >
                                    {subscriptions.map((sub) => (
                                        <MenuItem key={sub._id} value={sub._id}>
                                            {sub.masterSubscription?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <br />

                    {/* Coupon Code & Apply Button */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                            <TextField fullWidth label="Coupon Code" name="couponCode" value={client.couponCode} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="secondary" onClick={applyCoupon} fullWidth>
                                Apply Coupon
                            </Button>
                        </Grid>
                    </Grid>

                    <br />

                    {/* Submit Button */}
                    <Button fullWidth variant="contained" color="primary" type="submit">
                        Register Client
                    </Button>

                    <br /><br />

                    {/* Final Price (Hidden Initially, Shown After Submit) */}
                    {finalPrice !== null && (
                        <Typography variant="h6" color="primary" align="center">
                            Final Price: ₹{finalPrice}
                        </Typography>
                    )}

                </form>

                <br />

                {/* Show Exactly 3 Subscriptions */}
                <Typography variant="h6" gutterBottom>Available Subscriptions:</Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={2}>
                        {subscriptions.map((sub) => (
                            <Grid item xs={12} sm={4} key={sub._id}>
                                <Paper elevation={2} sx={{ padding: "10px", textAlign: "center" }}>
                                    <Typography variant="h6">{sub.masterSubscription?.name}</Typography>
                                    <Typography variant="body2">Validity: {sub.masterSubscription?.validityInDays} days</Typography>
                                    <Typography variant="body2">Employees: {sub.masterSubscription?.maxEmployees}</Typography>
                                    <Typography variant="h6">₹{sub.sellingPrice}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <br />

                {/* Available Coupons Section */}
                <Typography variant="h6">Available Coupons:</Typography>
                <Paper elevation={2} style={{ padding: "10px", backgroundColor: "#f5f5f5" }}>
                    {coupons.length > 0 ? (
                        coupons.map(coupon => (
                            <Typography key={coupon._id}>
                                <LocalOfferIcon style={{ color: "green" }} />
                                <strong>{coupon.code}</strong> - {coupon.couponType}: {coupon.couponValue}
                            </Typography>
                        ))
                    ) : (
                        <Typography>No Coupons Available</Typography>
                    )}
                </Paper>

            </Paper>
        </Container>
    );
};

export default ClientRegistration;
