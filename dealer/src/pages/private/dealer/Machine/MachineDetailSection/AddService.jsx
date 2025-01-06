import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

const SampleForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 600,
        margin: "auto",
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" sx={{ marginBottom: "1rem", textAlign: "center" }}>
        Sample Form
      </Typography>
      <Grid container spacing={2}>
        {/* Title Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            variant="outlined"
            required
          />
        </Grid>
        
        {/* Email Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            required
          />
        </Grid>

        {/* Description Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={4}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ padding: "0.75rem" }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SampleForm;
