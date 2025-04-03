import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const SubscriptionMaster = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Fetch subscriptions from backend
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/subscription/subscriptions")
      .then((res) => {
        console.log("Fetched data:", res.data);
        setSubscriptions(Array.isArray(res.data.data.data) ? res.data.data.data : []);
      })
      .catch((err) => {
        console.error("Error fetching subscriptions:", err);
        setSubscriptions([]); // Ensure subscriptions is always an array
      });
  }, []);

  // Add description
  const addDescription = () => {
    if (description.trim()) {
      setDescriptions([...descriptions, description.trim()]);
      setDescription("");
    }
  };

  // Remove description
  const removeDescription = (index) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  // Open edit modal
  const openEditModal = (index) => {
    console.log("Opening edit modal for index:", index);
    setEditIndex(index);
    setEditText(descriptions[index] || ""); // Ensure it's not undefined
    setEditModalOpen(true);
  };


  // Save edited description
  const saveEditedDescription = () => {
    const updatedDescriptions = [...descriptions];
    updatedDescriptions[editIndex] = editText.trim();
    setDescriptions(updatedDescriptions);
    setEditModalOpen(false);
  };

  // Submit new subscription
  const submitSubscription = () => {
    if (!name.trim()) {
      alert("Subscription name is required!");
      return;
    }
    if (descriptions.length === 0) {
      alert("At least one description is required!");
      return;
    }

    axios
      .post("http://localhost:8080/api/subscription/add-subs", {
        name,
        descriptions,
      })
      .then((res) => {
        alert(res.data.message);
        setSubscriptions([...subscriptions, res.data.data]);
        setName("");
        setDescriptions([]);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error adding subscription");
      });
  };

  // Toggle subscription status (Activate/Deactivate)
  const toggleSubscriptionStatus = (id, isActive) => {
    const endpoint = isActive
      ? `http://localhost:8080/api/subscription/deactivate/${id}`
      : `http://localhost:8080/api/subscription/activate/${id}`;

    axios
      .put(endpoint)
      .then((res) => {
        alert(res.data.message);
        setSubscriptions(
          subscriptions.map((sub) =>
            sub._id === id ? { ...sub, isActive: !sub.isActive } : sub
          )
        );
      })
      .catch((err) => alert("Error updating status"));
  };

  // Open subscription details modal
  const openDetailsModal = (subscription) => {
    setSelectedSubscription(subscription);
    setDetailsModalOpen(true);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Subscription Manager</h2>

      {/* Subscription Form */}
      <div className="mb-4">
        <TextField
          label="Subscription Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2"
        />
        <div className="d-flex">
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button variant="contained" color="primary" className="ms-2" onClick={addDescription}>
            Add
          </Button>
        </div>
      </div>

      {/* Description List */}
      {descriptions.length > 0 && (
        <TableContainer component={Paper} className="mb-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {descriptions.map((desc, index) => (
                <TableRow key={index}>
                  <TableCell>{desc}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => openEditModal(index)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => removeDescription(index)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Submit Button */}
      <Button variant="contained" color="success" fullWidth onClick={submitSubscription}>
        Submit Subscription
      </Button>

      {/* Subscription List */}
      <h3 className="mt-5">Subscription List</h3>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => openDetailsModal(sub)}
                  >
                    {sub.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={sub.isActive ? "success" : "warning"}
                      onClick={() => toggleSubscriptionStatus(sub._id, sub.isActive)}
                    >
                      {sub.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {sub.isActive && (
                      <Button variant="contained" color="primary" href="/SubscriptionManagement">
                        Manage
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: "center" }}>
                  No subscriptions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Subscription Details Modal */}
      <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
        <DialogTitle>Subscription Details</DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <div>
              <p><strong>Name:</strong> {selectedSubscription.name}</p>
              <p><strong>Status:</strong> {selectedSubscription.isActive ? "Active" : "Inactive"}</p>
              <p><strong>Descriptions:</strong></p>
              <ul>
                {selectedSubscription.descriptions.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Description</DialogTitle>
        <DialogContent>
          <TextField
            label="Edit Description"
            variant="outlined"
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={saveEditedDescription} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default SubscriptionMaster;
