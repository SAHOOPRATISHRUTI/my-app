import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8080/api/coupon";
const getToken = () => localStorage.getItem("token"); // Retrieve token

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "PERCENTAGE",
    minPurchase: "",
    expiresAt: "",
    usageLimit: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCoupons(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch coupons!");
    }
  };

  const handleOpen = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon._id);
      setFormData({
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType,
        minPurchase: coupon.minPurchase,
        expiresAt: coupon.expiresAt.split("T")[0], // Format date for input
        usageLimit: coupon.usageLimit,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        discount: "",
        discountType: "PERCENTAGE",
        minPurchase: "",
        expiresAt: "",
        usageLimit: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      code: "",
      discount: "",
      discountType: "PERCENTAGE",
      minPurchase: "",
      expiresAt: "",
      usageLimit: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.discount || !formData.minPurchase || !formData.expiresAt || !formData.usageLimit) {
      toast.error("All fields are required!");
      return;
    }

    if (Number(formData.discount) <= 0 || Number(formData.minPurchase) <= 0 || Number(formData.usageLimit) <= 0) {
      toast.error("Discount, Minimum Purchase, and Usage Limit must be positive numbers!");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("Coupon updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/create`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("Coupon added successfully!");
      }
      fetchCoupons();
      handleClose();
    } catch (error) {
      toast.error("Operation failed!");
    }
  };

  const openDeleteDialog = (id) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  // const handleDelete = async () => {
  //   if (!couponToDelete) {
  //     toast.error("Invalid Coupon ID!");
  //     return;
  //   }
  
  //   console.log("Deleting Coupon ID:", couponToDelete); // Debugging log
  
  //   try {
  //     await axios.delete(`${API_BASE_URL}/delete/${couponToDelete}`, {
  //       headers: { Authorization: `Bearer ${getToken()}` },
  //     });
      
  
  //     toast.success("Coupon deleted successfully!");
  //     fetchCoupons();
  //   } catch (error) {
  //     toast.error("Failed to delete coupon!");
  //   }
  //   setDeleteDialogOpen(false);
  // };
  
  const handleDelete = async () => {
    if (!couponToDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8080/api/coupon/delete/${couponToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully!");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete product!");
    }
    setDeleteDialogOpen(false); // Close dialog after delete
  };
  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Coupon Management
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Coupon
        </Button>

        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Code</b></TableCell>
                <TableCell><b>Discount</b></TableCell>
                <TableCell><b>Discount Type</b></TableCell>
                <TableCell><b>Min Purchase</b></TableCell>
                <TableCell><b>Expires At</b></TableCell>
                <TableCell><b>Usage</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.discount}{coupon.discountType === "PERCENTAGE" ? "%" : "₹"}</TableCell>
                  <TableCell>{coupon.discountType}</TableCell>
                  <TableCell>₹{coupon.minPurchase}</TableCell>
                  <TableCell>{new Date(coupon.expiresAt).toLocaleDateString()}</TableCell>
                  <TableCell>{coupon.usedCount}/{coupon.usageLimit}</TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => handleOpen(coupon)}>Edit</Button>
                    <Button color="secondary" onClick={() => openDeleteDialog(coupon._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        <DialogContent>
          <TextField name="code" label="Coupon Code" fullWidth margin="dense" value={formData.code} onChange={handleChange} />
          <TextField name="discount" label="Discount" type="number" fullWidth margin="dense" value={formData.discount} onChange={handleChange} />
          <TextField name="minPurchase" label="Min Purchase (₹)" type="number" fullWidth margin="dense" value={formData.minPurchase} onChange={handleChange} />
          <TextField name="expiresAt" label="Expiration Date" type="date" fullWidth margin="dense" value={formData.expiresAt} onChange={handleChange} />
          <TextField name="usageLimit" label="Usage Limit" type="number" fullWidth margin="dense" value={formData.usageLimit} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{editingId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
       <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this product?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="secondary">Cancel</Button>
                <Button onClick={handleDelete} color="error">Delete</Button>
              </DialogActions>
            </Dialog>
    </Container>
  );
};

export default CouponPage;
