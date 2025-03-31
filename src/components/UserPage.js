import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:8080/api"; // Update with your backend URL
const getToken = () => localStorage.getItem("token");

const UserPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") {
      toast.error("Access Denied! Only users can access this page.");
      navigate("/");
    } else {
      fetchProducts();
      fetchCart();
    }
  }, [navigate]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/product/getAllProduct`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProducts(response.data?.data || []);
    } catch (error) {
      toast.error("Failed to load products!");
      setProducts([]);
    }
  };

  // Fetch user's cart
  const fetchCart = async () => {
    try {
        const userId = localStorage.getItem("userId"); // Get userId from localStorage
        if (!userId) {
            toast.error("User ID not found. Please log in again.");
            return;
        }

        const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
console.log(response);

        // Find the cart for this specific user
        const userCart = response.data.data.find(cart => cart.userId._id === userId);
        if (userCart) {
            setCart(userCart);
        } else {
            setCart(null);
        }
    } catch (error) {
        toast.error("Failed to fetch cart!");
    }
};


  // Handle quantity change
  const handleQuantityChange = (productId, change, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, Math.min(stock, (prev[productId] || 1) + change)),
    }));
  };

  // Add product to cart
  const handleAddToCart = async (productId) => {
    const quantity = quantities[productId] || 1;
    const userId = localStorage.getItem("userId"); // Get user ID

    if (!userId) {
        toast.error("User not logged in!");
        return;
    }

    try {
        // Fetch existing cart data
        const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        let cartId;
        const existingCart = response.data.data.find(cart => cart.userId === userId || cart.userId._id === userId);

        if (existingCart) {
            cartId = existingCart._id;
            await axios.post(
                `${API_BASE_URL}/cart/${cartId}/product`,
                { productId, quantity },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
        } else {
            // Create a new cart and add the product
            const newCartResponse = await axios.post(
                `${API_BASE_URL}/cart`,
                { userId, products: [{ productId, quantity }] },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            cartId = newCartResponse.data.data._id;
        }

        toast.success("Product added to cart!");
        navigate(`/cart/checkout`); // ✅ Navigate to checkout page
    } catch (error) {
        console.error("Add to Cart Error:", error.response?.data || error.message);
        toast.error("Failed to add product to cart!");
    }
};




  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    toast.info("Logged out successfully!");
    navigate("/");
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "50px", textAlign: "center" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>Welcome, User!</Typography>
        <Typography variant="body1">Browse products and enjoy shopping.</Typography>

        {/* Product List */}
        <Grid container spacing={3} style={{ marginTop: "20px" }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image || "https://via.placeholder.com/150"}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2">Price: ₹{product.price}</Typography>
                  <Typography variant="body2" color={product.stock > 0 ? "green" : "red"}>
                    Stock: {product.stock > 0 ? product.stock : "Out of stock"}
                  </Typography>

                  {/* Quantity Selector */}
                  {product.stock > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "10px" }}>
                      <IconButton
                        onClick={() => handleQuantityChange(product._id, -1, product.stock)}
                        size="small"
                        disabled={(quantities[product._id] || 1) <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </IconButton>

                      <TextField
                        value={quantities[product._id] || 1}
                        variant="outlined"
                        size="small"
                        style={{ width: "50px", textAlign: "center" }}
                        inputProps={{ readOnly: true }}
                      />

                      <IconButton
                        onClick={() => handleQuantityChange(product._id, 1, product.stock)}
                        size="small"
                        disabled={(quantities[product._id] || 1) >= product.stock}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </IconButton>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddToCart(product._id)}
                    style={{ marginTop: "10px" }}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Logout Button */}
        <Button
          variant="contained"
          color="secondary"
          style={{ marginTop: "20px" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default UserPage;
