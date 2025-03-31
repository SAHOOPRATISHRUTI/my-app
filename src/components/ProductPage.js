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

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8080/api/product/getAllProduct", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch products!");
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8080/api/product/deleteProduct/${productToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product!");
    }
    setDeleteDialogOpen(false); // Close dialog after delete
  };

  const openDeleteDialog = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        image: product.image,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        image: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
      image: "",
    });
  };
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.category || !formData.stock || !formData.image) {
      toast.error("All fields are required!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/product/updateProduct/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/product/createProduct", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added successfully!");
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      toast.error("Operation failed!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Product Management
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Product
        </Button>

        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Price</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Category</b></TableCell>
                <TableCell><b>Stock</b></TableCell>
                <TableCell><b>Image</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <img src={product.image} alt={product.name} width="50" height="50" />
                  </TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => handleOpen(product)}>Edit</Button>
                    <Button color="secondary" onClick={() => openDeleteDialog(product._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Product Name" fullWidth margin="dense" value={formData.name} onChange={handleChange} />
          <TextField name="price" label="Price" type="number" fullWidth margin="dense" value={formData.price} onChange={handleChange} />
          <TextField name="description" label="Description" fullWidth margin="dense" value={formData.description} onChange={handleChange} />
          <TextField name="category" label="Category" fullWidth margin="dense" value={formData.category} onChange={handleChange} />
          <TextField name="stock" label="Stock" type="number" fullWidth margin="dense" value={formData.stock} onChange={handleChange} />
          <TextField name="image" label="Image URL" fullWidth margin="dense" value={formData.image} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={() => handleSubmit()} color="primary">{editingId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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

export default ProductPage;
