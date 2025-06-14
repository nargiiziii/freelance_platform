import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/features/authSlice';
import { useNavigate } from 'react-router-dom';
import style from './Login.module.scss';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser({ email, password }));

    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/dashboard'); // токены уже в cookie, просто перенаправляем
    }
  };

  return (
    <div className={style.loginContainer}>
      <div className={style.loginBox}>
        <h2 className={style.title}>Вход</h2>
        <form onSubmit={submitHandler}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>Войти</button>
          {error && <p className={style.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
