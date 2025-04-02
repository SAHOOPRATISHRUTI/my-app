import { Container, TextField, Typography, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError(""); // Clear error when typing
    };

    const validateEmail = () => {
        if (!email) {
            setError("Email is required");
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email format");
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        try {
            const response = await axios.post("http://localhost:8080/api/user/login", { email });
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
            toast.error("Invalid email. Please try again.");
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
                        value={email}
                        onChange={handleChange}
                        error={!!error}
                        helperText={error}
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
