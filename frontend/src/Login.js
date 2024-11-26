import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS specific to this component

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      if (response.data.message === 'Login successful!') {
        const userData = {
          username: response.data.username,
          role: response.data.role,
          id: response.data.id,
        };
        onLogin(userData);

        if (response.data.role === 'chef') {
          navigate('/add-recipe');
        } else {
          navigate('/recipes');
        }
      } else {
        setError('Invalid credentials or an error occurred.');
      }
    } catch (error) {
      setError('Invalid credentials or an error occurred.');
      console.error(error);
    }
  };

  return (
    <div className="login-page"> {/* Unique class for this component */}
      <div className="login-container">
        <h2 className="login-heading">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
