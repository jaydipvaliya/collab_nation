import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login(formData);
    navigate('/dashboard');
  };

  return (
    <div className="container narrow page-stack">
      <section className="page-heading">
        <span className="eyebrow">Login</span>
        <h1>Welcome back to CollabNation</h1>
        <p>Temporary client-side auth is enabled until JWT endpoints are implemented.</p>
      </section>

      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            onChange={handleChange}
            placeholder="founder@collabnation.dev"
            required
            type="email"
            value={formData.email}
          />
        </label>

        <label htmlFor="password">
          Password
          <input
            id="password"
            name="password"
            onChange={handleChange}
            placeholder="Enter your password"
            required
            type="password"
            value={formData.password}
          />
        </label>

        <button className="button" type="submit">
          Login
        </button>

        <p>
          New here?{' '}
          <Link className="inline-link" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

