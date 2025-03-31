import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Paper, Grid } from "@mui/material";
import { toast } from "react-toastify";

const AdminPage = () => {
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.error("Access Denied! Only admins can access this page.");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.info("Logged out successfully!");
    navigate("/");
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "50px", textAlign: "center" }}>
      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Admin!
        </Typography>
        <Typography variant="body1">
          Manage products, orders, and users from here.
        </Typography>

        {/* Admin Navigation */}
        <Grid container spacing={2} justifyContent="center" style={{ marginTop: "20px" }}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={() => navigate("/admin/products")}>
              Manage Products
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={() => navigate("/admin/coupons")}>
              Manage Coupons
            </Button>
          </Grid>
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

export default AdminPage;
