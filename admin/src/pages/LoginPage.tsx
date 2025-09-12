import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../hooks/useAuthMutation";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

const login = useLoginMutation();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
	 await login.mutateAsync({ email, password });
	
    nav("/users");
  } catch (err: any) {
    setErr(err?.response?.data?.message || "Login error");
  }
};

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h6" gutterBottom>
          Admin Login
        </Typography>
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={login.isPending}
          >
            {login.isPending ? "Logging in…" : "Login"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
