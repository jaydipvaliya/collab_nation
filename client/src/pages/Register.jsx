import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
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
    register(formData);
    navigate('/dashboard');
  };

  return (
    <div className="container narrow page-stack">
      <section className="page-heading">
        <span className="eyebrow">Register</span>
        <h1>Create your collaborator account</h1>
        <p>This form is ready to connect to real JWT authentication routes when you add them.</p>
      </section>

      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="name">
          Full name
          <input
            id="name"
            name="name"
            onChange={handleChange}
            placeholder="Your full name"
            required
            type="text"
            value={formData.name}
          />
        </label>

        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
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
            placeholder="Create a password"
            required
            type="password"
            value={formData.password}
          />
        </label>

        <button className="button" type="submit">
          Register
        </button>

        <p>
          Already have an account?{' '}
          <Link className="inline-link" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

