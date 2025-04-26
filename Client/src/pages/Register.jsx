import {
    Button,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password || !email) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            const user = await registerUser({
                username,
                password,
                email,
            });
            console.log(`User registered: ${user}`);
            navigate(`/login`);
        } catch (error) {
            setError("Registration failed. Please try again.");
            console.error("Registration error:", error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper sx={{ padding: 3 }} elevation={3}>
                <Typography variant="h5" align="center" gutterBottom>
                    Register
                </Typography>
                {error && (
                    <Typography variant="body2" color="error" align="center" gutterBottom>
                        {error}
                    </Typography>
                )}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ padding: 1 }}
                            >
                                Register
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <Grid container justifyContent="flex-end" sx={{ marginTop: 2 }}>
                    <Grid item>
                        <Button
                            variant="text"
                            color="secondary"
                            onClick={() => navigate("/login")}
                        >
                            Already have an account? Login
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Register;
