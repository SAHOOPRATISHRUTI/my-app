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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";

const SubscriptionManagement = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [subscriptions, setSubscriptions] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [subscriptionNames, setSubscriptionNames] = useState([]);
  const [message, setMessage] = useState("");
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchSubscriptionList = async () => {
    try {
      const response = await axios.get(
        "http://192.168.29.156:8080/api/manageSubscription"
      );
  
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log("Fetched Subscriptions:", response.data.data); // Debugging
  
        // ✅ Group subscriptions by name & pick the correct version
        const groupedSubscriptions = {};
        response.data.data.forEach((sub) => {
          const subName = sub.masterSubscription?.name || "N/A";
          const subWef = new Date(sub.wef); // Convert `wef` to Date object
  
          if (
            !groupedSubscriptions[subName] || 
            subWef < new Date(groupedSubscriptions[subName].wef) // Pick earliest date
          ) {
            groupedSubscriptions[subName] = sub; 
          }
        });
  
        // ✅ Convert to array for rendering
        const sortedSubscriptions = Object.values(groupedSubscriptions).sort(
          (a, b) => new Date(a.wef) - new Date(b.wef) // Sort in ascending order (earliest first)
        );
  
        setSubscriptions(sortedSubscriptions);
        setAllSubscriptions(response.data.data); // Keep all for details view
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };
  
  
  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptionList();
  }, []);

  const fetchSubscriptionMaster = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/subscription/subscriptions"
      );
      console.log(response);
      // Adjust API endpoint
      if (response.data.success && Array.isArray(response.data.data.data)) {
        console.log("Fetched Master Subscriptions:", response.data.data.data); // Debugging output

        // Extract subscription names
        const names = response.data.data.data.map((sub) => ({
          id: sub._id,
          name: sub.name,
        }));
        setSubscriptionNames(names);
      }
    } catch (error) {
      console.error("Error fetching subscription names:", error);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchSubscriptionMaster();
  }, []);

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
      let subs = groupedSubscriptions[name].sort(
        (a, b) => new Date(a.wef) - new Date(b.wef)
      );
      return subs.find((sub) => new Date(sub.wef) <= today) || subs[0];
    });
  };

  const onSubmit = async (data) => {
    setMessage(""); // Clear previous messages
  
    console.log("Form Data Submitted:", data); // Debugging log
  
    // ✅ Check if subscription name is selected
    if (!data.masterSubscriptionId) {
      setMessage("❌ Subscription name is required.");
      return;
    }
  
    const subscriptionName = String(data.name).toUpperCase(); // ✅ Ensure it's a string
  
    // ✅ Ensure required fields are filled
    if (!data.validityInDays || !data.maxEmployees) {
      setMessage("❌ Validity and Max Employees are required fields.");
      return;
    }
  
    // ✅ Convert prices to numbers safely
    const displayPrice = parseFloat(data.displayPrice);
    const sellingPrice = parseFloat(data.sellingPrice);
  
    console.log("Debug Prices -> Display:", displayPrice, "Selling:", sellingPrice);
  
    // ✅ Ensure selling price is less than display price
    if (isNaN(displayPrice) || isNaN(sellingPrice)) {
      setMessage("❌ Invalid price values.");
      return;
    }
  
    if (sellingPrice >= displayPrice) {
      setMessage("❌ Selling price must be less than display price.");
      return;
    }
  
    try {
      // ✅ Send valid data to backend
      await axios.post("http://localhost:8080/api/manageSubscription/register", {
        ...data,
      });
  
      setMessage("✅ Subscription created successfully!");
      fetchSubscriptionMaster(); // Refresh subscription list
  
      // ✅ Reset form and clear validation errors
      reset({}, { keepErrors: false, keepDirty: false });
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
    }
  };
  

  const handleViewDetails = (subName) => {
    const filteredData = allSubscriptions.filter(
      (sub) => sub.masterSubscription?.name === subName
    );
    setFilteredSubs(filteredData);
    setOpen(true);
  };

  return (
    <Box
      sx={{
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "5px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Subscription Management
      </Typography>

      {message && (
        <Typography color={message.includes("✅") ? "green" : "red"}>
          {message}
        </Typography>
      )}

      {/* Form for Adding Subscription */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: "20px" }}>
        <FormControl fullWidth margin="normal" error={!!errors.name}>
          <InputLabel>Subscription Name</InputLabel>
          <Select
            {...register("masterSubscriptionId", {
              required: "Subscription name is required",
            })}
            defaultValue="" // Ensure default value matches subscription IDs
          >
            {subscriptionNames.length > 0 ? (
              subscriptionNames.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name} ({sub.id}) {/* ✅ Display both Name & ID */}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No subscriptions available</MenuItem>
            )}
          </Select>
          {errors.name && (
            <FormHelperText>{errors.name.message}</FormHelperText>
          )}
        </FormControl>

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
          {...register("displayPrice", {
            required: "Display Price is required",
          })}
          error={!!errors.displayPrice}
          helperText={errors.displayPrice?.message}
        />

        <TextField
          label="Selling Price"
          type="number"
          fullWidth
          margin="normal"
          {...register("sellingPrice", {
            required: "Selling Price is required",
          })}
          error={!!errors.sellingPrice}
          helperText={errors.sellingPrice?.message}
        />

        <TextField
          label="Max Employees"
          type="number"
          fullWidth
          margin="normal"
          {...register("maxEmployees", {
            required: "Max Employees is required",
          })}
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Create Subscription
        </Button>
      </form>

      {/* Subscription Table */}
      <Typography variant="h5" gutterBottom>
        Subscription List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
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
            {subscriptions.map((sub, index) => (
              <TableRow key={sub._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{sub.masterSubscription?.name || "N/A"}</TableCell>
                <TableCell>₹{sub.displayPrice}</TableCell>
                <TableCell>₹{sub.sellingPrice}</TableCell>
                <TableCell>{new Date(sub.wef).toLocaleDateString("en-GB")}</TableCell>
                <TableCell>{sub.maxEmployees}</TableCell>
                <TableCell>{sub.validityInDays} Days</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() =>
                      handleViewDetails(sub.masterSubscription?.name)
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Subscription Details Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Subscription Details</DialogTitle>
        <DialogContent>
          {filteredSubs.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>No</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Display Price</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Selling Price</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Max Employees</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Validity (Days)</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Effect From</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubs.map((sub, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {sub.masterSubscription?.name || "N/A"}
                      </TableCell>
                      <TableCell>₹{sub.displayPrice}</TableCell>
                      <TableCell>₹{sub.sellingPrice}</TableCell>
                      <TableCell>{sub.maxEmployees}</TableCell>
                      <TableCell>{sub.validityInDays} Days</TableCell>
                      <TableCell>{new Date(sub.wef).toLocaleDateString("en-GB")}</TableCell>

                      <TableCell>{sub.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement;
