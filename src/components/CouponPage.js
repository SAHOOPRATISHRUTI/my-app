import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Container, Typography, TextField, Select, MenuItem, Button, Table, 
  TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Grid 
} from "@mui/material";



const CouponComponent = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    couponType: "Percentage",
    couponValue: "",
    startsFrom: "",
    endsOn: "",
  });

  const API_URL = "http://localhost:8080/api/coupon";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/list`);
      setCoupons(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load coupons");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endsOn) <= new Date(formData.startsFrom)) {
      toast.error("End date must be after start date!");
      return;
    }

    try {
      await axios.post(`${API_URL}/create`, formData, getAuthHeaders());
      toast.success("Coupon created successfully!");
      fetchCoupons();
      setFormData({ code: "", couponType: "Percentage", couponValue: "", startsFrom: "", endsOn: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Coupon Management
      </Typography>

      {/* Coupon Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Coupon Code" name="code" value={formData.code} 
                onChange={handleChange} required variant="outlined" 
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select fullWidth name="couponType" value={formData.couponType} onChange={handleChange}>
                <MenuItem value="Percentage">Percentage</MenuItem>
                <MenuItem value="Fixed">Fixed Amount</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Coupon Value" name="couponValue" type="number" 
                value={formData.couponValue} onChange={handleChange} required variant="outlined" 
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Start Date" name="startsFrom" type="date" value={formData.startsFrom} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="End Date" name="endsOn" type="date" value={formData.endsOn} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                Create Coupon
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Coupon List */}
      <Typography variant="h5" gutterBottom>
        All Coupons
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow key={coupon.code}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.couponType}</TableCell>
                  <TableCell>{coupon.couponType === "Percentage" ? `${coupon.couponValue}%` : `$${coupon.couponValue}`}</TableCell>
                  <TableCell>{new Date(coupon.startsFrom).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(coupon.endsOn).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No coupons available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CouponComponent;
