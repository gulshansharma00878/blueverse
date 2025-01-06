import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";
import { ManageMachinesServices } from "network/manageMachinesServices"
import Toast from "components/utitlities-components/Toast/Toast"
import { useNavigate } from "react-router-dom"


const ServiceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceCenter: "Rama road- delhi TVS",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    // navigate("/dealer/machines/details/ab630888-b018-4659-b673-f40f66f02b10")

    // console.log("Form Submitted:", formData);
    const response = await ManageMachinesServices.machinesServiceRequest(formData)
    if (response.success && response.code === 200) {
      // setData(response?.data)
      Toast.showInfoToast("Service request stored successfully.");
      navigate("/dealer/machines/details/ab630888-b018-4659-b673-f40f66f02b10")
    } else {
      Toast.showErrorToast(response?.message)
    }
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
      method="post"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" sx={{ marginBottom: "1rem", textAlign: "center" }}>
        Add new service 
      </Typography>
      <Grid container spacing={2}>
        {/* Title Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="service Center"
            name="serviceCenter"
            value={formData.serviceCenter}
            onChange={handleChange}
            variant="outlined"
            disabled= {true}
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

export default ServiceForm;
