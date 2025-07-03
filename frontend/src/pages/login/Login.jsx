import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/features/authSlice";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import style from "./Login.module.scss";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("E-poçt düzgün deyil").required("E-poçt vacibdir"),
    password: Yup.string().required("Şifrə vacibdir"),
  });

  const handleSubmit = async (values) => {
    const result = await dispatch(loginUser(values));

    if (result.meta.requestStatus === "fulfilled") {
      const user = result.payload.user;

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className={style.loginContainer}>
      <div className={style.loginBox}>
        <h2 className={style.title}>Giriş</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <Field
                name="email"
                type="email"
                placeholder="E-poçt"
                className={style.input}
              />
              <ErrorMessage name="email" component="div" className={style.error} />

              <Field
                name="password"
                type="password"
                placeholder="Şifrə"
                className={style.input}
              />
              <ErrorMessage name="password" component="div" className={style.error} />

              <button type="submit" disabled={loading}>
                Daxil ol
              </button>

              {error && <p className={style.error}>{error}</p>}
            </Form>
          )}
        </Formik>

        <div className={style.welcomeWrapper}>
          <div className={style.welcomeText}>Xoş gəlmisiniz</div>
          <span className={style.wave}>👋</span>
        </div>
        <div className={style.subtext}>Sizi yenidən görmək xoşdur!</div>
      </div>
    </div>
  );
}

export default Login;
