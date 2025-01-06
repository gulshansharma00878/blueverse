import React, { useState } from "react";
import { Grid, Button, Typography, Box, TextField } from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"
import Toast from "components/utilities-components/Toast/Toast"
import { ManageWashService } from "network/manageWashService"

const FileUploadForm = () => {
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus(""); 
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            Toast.showErrorToast("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setUploadStatus("Uploading...");
            let washResponse = await ManageWashService.importWashList(formData)
            if (washResponse.code === 200 && washResponse.success) {
                Toast.showErrorToast(`File uploaded successfully!`);
                navigate('/admin/wash-list')
            } else {
                Toast.showErrorToast("File upload failed. Please try again.");
            }
            //   const response = await axios.post("", formData, {
            //     headers: {
            //       "Content-Type": "multipart/form-data",
            //     },
            //   });

            //   if (response.status === 200) {
            //     Toast.showErrorToast(`File uploaded successfully!`)
            //   } else {
            //     Toast.showErrorToast("File upload failed. Please try again.");
            //   }
        } catch (error) {
            console.error("Error uploading file:", error);
            Toast.showErrorToast("Error uploading file. Please check the console for details.");
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 500,
                margin: "auto",
                padding: "2rem",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Typography variant="h5" align="center" sx={{ marginBottom: "1rem" }}>
                Import CSV or Excel File
            </Typography>
            <Grid container spacing={3}>
                {/* File Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        inputProps={{ style: { padding: "0.75rem" } }}
                        helperText="Supported formats: .csv, .xlsx, .xls"
                    />
                </Grid>

                {selectedFile && (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="textSecondary">
                            Selected File: {selectedFile.name}
                        </Typography>
                    </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<UploadFile />}
                        sx={{ padding: "0.75rem" }}
                    >
                        Upload File
                    </Button>
                </Grid>

                {/* Upload Status */}
                {uploadStatus && (
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" align="center">
                            {uploadStatus}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default FileUploadForm;
