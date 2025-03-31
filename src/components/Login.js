

import { Container, TextField, Typography, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // Clear errors when typing
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post("http://localhost:8080/api/user/login", {
                email: formData.email,
                password: formData.password,
            });
            console.log(response.data);
            

            if (response.data.data.token) {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("role", response.data.data.role);
                localStorage.setItem("userId", response.data.data._id);

                toast.success("Login Successful!");
            
                setTimeout(() => {
                    navigate(response.data.data.role === "admin" ? "/admin" : "/user");
                }); 
            }
            
        } catch (error) {
            toast.error("Invalid credentials. Please try again.");
            console.error("Login Error:", error);
        }
    };

    return (
        <Container maxWidth="xs" style={{ marginTop: "50px" }}>
            <Paper elevation={2} style={{ padding: "20px" }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Login
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        name="email"
                        label="Email"
                        placeholder="Enter Your Email"
                        margin="normal"
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        type="password"
                        name="password"
                        label="Password"
                        placeholder="Enter Your Password"
                        margin="normal"
                        fullWidth
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                    />

                    <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: "20px" }}>
                        Login
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;
