import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";
import { ManageMachinesServices } from "network/manageMachinesServices";
import Toast from "components/utitlities-components/Toast/Toast";
import { useNavigate, useParams } from "react-router-dom";

const ServiceForm = () => {
  const {machineId} = useParams()
  // console.log("machineId is", machineId)
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    machineId:machineId ?? '',
    serviceCenter: "Rama road- delhi TVS",
    description: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ManageMachinesServices.machinesServiceRequest(formData);
      if (response.success && response.code === 200) {
        Toast.showInfoToast("Service request stored successfully.");
        navigate("/dealer/machines/details/ab630888-b018-4659-b673-f40f66f02b10");
      } else {
        Toast.showErrorToast(response?.message || "An error occurred.");
      }
    } catch (error) {
      Toast.showErrorToast("Failed to submit the service request.");
      console.error("Submission Error:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // minHeight: "100vh", // Ensures full screen height
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        margin: 0,
      }}
    >
      {/* Header with custom styles */}
      <Typography
        variant="h4"
        sx={{
          marginBottom: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
          color: "#1976d2", // Change header color
          fontFamily: "'Roboto', sans-serif", // Custom font
        }}
      >
        Add New Service
      </Typography>

      <Grid container spacing={3} sx={{ width: "100%", maxWidth: 600 }}>
        {/* Service Center Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Service Center"
            name="serviceCenter"
            value={formData.serviceCenter}
            onChange={handleChange}
            variant="outlined"
            disabled
            required
            sx={{
              "& .MuiInputLabel-root": { color: "#1976d2" }, // Custom label color
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" }, // Custom border color
              },
            }}
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
            required
            sx={{
              "& .MuiInputLabel-root": { color: "#1976d2" }, // Custom label color
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#1976d2" }, // Custom border color
              },
            }}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              padding: "0.75rem",
              fontWeight: "bold",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0", // Hover color
              },
            }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceForm;
