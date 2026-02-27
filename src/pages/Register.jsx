import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // reuse same styling

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "farmer",
    farm_name: "",
    location: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Registration successful!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError("Backend not reachable");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🌿 SpinachChain Register</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input name="username" onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" onChange={handleChange} required />

          <label>Role</label>
          <select name="role" onChange={handleChange}>
            <option value="farmer">Farmer</option>
            <option value="transporter">Transporter</option>
            <option value="cold_storage">Cold Storage</option>
            <option value="retailer">Retailer</option>
          </select>

          {formData.role === "farmer" && (
            <>
              <label>Farm Name</label>
              <input name="farm_name" onChange={handleChange} required />

              <label>Location</label>
              <input name="location" onChange={handleChange} required />
            </>
          )}

          <button type="submit">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "green", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;