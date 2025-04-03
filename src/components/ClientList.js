import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, CircularProgress } from "@mui/material";

const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:8080/api/client/list")
            .then(res => setClients(res.data.data))
            .catch(() => console.error("Failed to load clients"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Paper sx={{ padding: "20px", marginTop: "30px", borderRadius: "10px" }}>
            <Typography variant="h4" align="center" gutterBottom>
                Registered Clients
            </Typography>

            {loading ? <CircularProgress /> : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Subscription</strong></TableCell>
                            <TableCell><strong>Display Price</strong></TableCell>
                            <TableCell><strong>Selling Price</strong></TableCell>
                            <TableCell><strong>Coupon Code</strong></TableCell>
                            <TableCell><strong>Total Price</strong></TableCell>
                            <TableCell><strong>Registration Date</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.map(client => (
                            <TableRow key={client._id}>
                                <TableCell>{client.name}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>{client.subscriptionType}</TableCell>
                                <TableCell>₹{client.displayPrice}</TableCell>
                                <TableCell>₹{client.sellingPrice}</TableCell>
                                <TableCell>{client.couponCode || "N/A"}</TableCell>
                                <TableCell>₹{client.totalPrice}</TableCell>
                                <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Paper>
    );
};

export default ClientList;
