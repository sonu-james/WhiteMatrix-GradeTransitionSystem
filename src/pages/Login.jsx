import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Paper,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🧠 Default credentials
  const defaultUser = { username: "admin", password: "12345" };

  // ✅ Button click handler
  const handleLogin = (e) => {
    e.preventDefault();

    if (
      form.username === defaultUser.username &&
      form.password === defaultUser.password
    ) {
      toast.success("Login Successful! 🎉");
      localStorage.setItem("isLoggedIn", "true");

      // Navigate after short delay to show toast
      setTimeout(() => navigate("/home"), 1500);
    } else {
      toast.error("Invalid username or password ❌");
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* 🌆 Left Side - Image */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/premium-photo/blue-factory-with-blue-silo-background_1195965-21787.jpg')",
        }}
      >
        <div className="h-full w-full bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center leading-snug">
            Grade Transition System
          </h1>
        </div>
      </div>

      {/* 🔐 Right Side - Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 sm:px-12">
        <Paper
          elevation={8}
          sx={{
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "40px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 0 25px rgba(0,0,0,0.4)",
          }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Login Portal
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* 👤 Username */}
            <Box
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#38bdf8",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 8px #3b82f6",
                  },
                  "& input": { color: "white" },
                },
              }}
            >
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: "#60a5fa" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* 🔑 Password */}
            <Box
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#38bdf8",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 8px #3b82f6",
                  },
                  "& input": { color: "white" },
                },
              }}
            >
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#60a5fa" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "#60a5fa" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* 🌈 Login Button */}
            <button
              type="submit"
              className="mt-2 w-full py-3 rounded-xl font-semibold text-lg 
              bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500
              hover:from-blue-500 hover:to-cyan-400 transition-all duration-300
              shadow-lg hover:shadow-cyan-500/40"
            >
              Login
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-6">
            © 2025 Polymer Grade Planner
          </p>
        </Paper>
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}
