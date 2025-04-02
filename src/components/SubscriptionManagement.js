import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";

const SubscriptionManagement = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [subscriptions, setSubscriptions] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [message, setMessage] = useState("");
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/manageSubscription");
      if (response.data.success && Array.isArray(response.data.data)) {
        setSubscriptions(processSubscriptions(response.data.data));
        setAllSubscriptions(response.data.data);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const processSubscriptions = (data) => {
    const today = new Date();
    const groupedSubscriptions = {};

    data.forEach((sub) => {
      if (!groupedSubscriptions[sub.name]) {
        groupedSubscriptions[sub.name] = [];
      }
      groupedSubscriptions[sub.name].push(sub);
    });

    return Object.keys(groupedSubscriptions).map((name) => {
      let subs = groupedSubscriptions[name].sort((a, b) => new Date(a.wef) - new Date(b.wef));
      return subs.find(sub => new Date(sub.wef) <= today) || subs[0];
    });
  };

  const onSubmit = async (data) => {
    const today = new Date();
    const wefDate = new Date(data.wef);
  
    // Ensure required fields are present
    if (!data.validityInDays || !data.maxEmployees) {
      setMessage("❌ Validity and Max Employees are required fields.");
      return;
    }
  
    // Validate Selling Price < Display Price
    if (parseFloat(data.sellingPrice) >= parseFloat(data.displayPrice)) {
      setMessage("❌ Selling price must be less than display price.");
      return;
    }
  
    // Check if a future WEF already exists
    const futureSubscription = allSubscriptions.find(sub => 
      sub.name.toUpperCase() === data.name.toUpperCase() && new Date(sub.wef) > today
    );
  
    if (futureSubscription && wefDate > today) {
      setMessage("❌ Only one scheduled subscription is allowed in the future.");
      return;
    }
  
    // Check if a subscription with the same WEF exists
    const existingSubscription = allSubscriptions.find(sub => 
      sub.name.toUpperCase() === data.name.toUpperCase() && new Date(sub.wef).toISOString() === wefDate.toISOString()
    );
  
    if (existingSubscription) {
      setMessage("❌ A subscription with this WEF already exists.");
      return;
    }
  
    try {
      await axios.post("http://localhost:8080/api/manageSubscription/register", {
        ...data,
        name: data.name.toUpperCase(), // Convert name to uppercase for consistency
      });
  
      setMessage("✅ Subscription created successfully!");
      fetchSubscriptions();
      reset();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
    }
  };
  
  const handleViewDetails = (subName) => {
    setFilteredSubs(allSubscriptions.filter(sub => sub.name === subName));
    setOpen(true);
  };

  return (
    <Box sx={{ maxWidth: "900px", margin: "auto", padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
      <Typography variant="h4" gutterBottom>Subscription Management</Typography>

      {message && <Typography color={message.includes("✅") ? "green" : "red"}>{message}</Typography>}

      {/* Form for Adding Subscription */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: "20px" }}>
        <TextField
          label="Subscription Name"
          fullWidth
          margin="normal"
          {...register("name", { required: "Name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="WEF (Start Date)"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          {...register("wef", { required: "Start date is required" })}
          error={!!errors.wef}
          helperText={errors.wef?.message}
        />

        <TextField
          label="Display Price"
          type="number"
          fullWidth
          margin="normal"
          {...register("displayPrice", { required: "Display price is required" })}
          error={!!errors.displayPrice}
          helperText={errors.displayPrice?.message}
        />

        <TextField
          label="Selling Price"
          type="number"
          fullWidth
          margin="normal"
          {...register("sellingPrice", { required: "Selling price is required" })}
          error={!!errors.sellingPrice}
          helperText={errors.sellingPrice?.message}
        />

        <TextField
          label="Max Employees"
          type="number"
          fullWidth
          margin="normal"
          {...register("maxEmployees", { required: "Max employees is required" })}
          error={!!errors.maxEmployees}
          helperText={errors.maxEmployees?.message}
        />

        <TextField
          label="Validity (Days)"
          type="number"
          fullWidth
          margin="normal"
          {...register("validityInDays", { required: "Validity is required" })}
          error={!!errors.validityInDays}
          helperText={errors.validityInDays?.message}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
          Create Subscription
        </Button>
      </form>

      {/* Subscription Table */}
      <Typography variant="h5" gutterBottom>Subscription List</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f4f4f4" }}>
              <TableCell>No</TableCell>
              <TableCell>Subscription Name</TableCell>
              <TableCell>Display Price</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Effect From</TableCell>
              <TableCell>Employee Max</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No active subscriptions found.</TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub, index) => (
                <TableRow key={sub._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{sub.name}</TableCell>
                  <TableCell>₹{sub.displayPrice}</TableCell>
                  <TableCell>₹{sub.sellingPrice}</TableCell>
                  <TableCell>{new Date(sub.wef).toLocaleDateString()}</TableCell>
                  <TableCell>{sub.maxEmployees}</TableCell>
                  <TableCell>{sub.validityInDays} Days</TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary" size="small" onClick={() => handleViewDetails(sub.name)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Viewing Details */}
      <Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Subscription Details</DialogTitle>
  <DialogContent>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Subscription Name</TableCell>
          <TableCell>Display Price (₹)</TableCell>
          <TableCell>Selling Price (₹)</TableCell>
          <TableCell>Effect From</TableCell>
          <TableCell>Employee Max</TableCell>
          <TableCell>Validity (Days)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredSubs.map((sub, index) => (
          <TableRow key={sub._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{sub.name}</TableCell>
            <TableCell>₹{sub.displayPrice}</TableCell>
            <TableCell>₹{sub.sellingPrice || "N/A"}</TableCell>
            <TableCell>{new Date(sub.wef).toLocaleDateString()}</TableCell>
            <TableCell>{sub.maxEmployees}</TableCell>
            <TableCell>{sub.validityInDays}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)} color="primary">Close</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default SubscriptionManagement;
