import React, { useState } from 'react';
import axios from '../axiosInstance'; // твой инстанс axios с baseURL

export default function Register() {
  const [form, setForm] = useState({
    role: 'freelancer',
    name: '',
    email: '',
    password: '',
    avatar: '',
    bio: '',
    skills: [],
    portfolio: [],
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/auth/register', form);
      console.log('Успешно зарегистрированы:', response.data);
      // здесь можно сохранить токены и перейти на другой экран
      localStorage.setItem('token', response.data.accessToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="freelancer">Freelancer</option>
        <option value="employer">Employer</option>
      </select>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      {/* остальные поля по желанию */}
      <button type="submit">Register</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}
