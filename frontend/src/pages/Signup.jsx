import useField from "../hooks/useField";
import useSignup from "../hooks/useSignup";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import * as jwtDecodeLib from "jwt-decode";
const jwtDecode = jwtDecodeLib.default || jwtDecodeLib;
const API_BASE = import.meta.env.VITE_API_BASE;

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // form fields
  const name = useField("name");
  const email = useField("email");
  const password = useField("password");
  const role = useField("role"); // optional, default 'user'
  const profile_pic = useField("profile_pic"); // optional URL
  const { value, onChange } = name;
  const emailField = useField("email");
  const passwordField = useField("password");
  const getInputProps = ({ setValue, ...rest }) => rest;

  const { signup, error } = useSignup(`${API_BASE}/api/users/signup`);
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE}/api/goog/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("user", JSON.stringify(data));
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };


  const handleFormSubmit = async (e) => {
    e.preventDefault();

    await signup({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value || "user",
      profile_pic: profile_pic.value || "",
    });

    if (!error) {
      console.log("Signup success");
      setIsAuthenticated(true);
      navigate("/");
    }
  };

  return (
    <div className="create">
      <h2>メンバー登録</h2>
      <form onSubmit={handleFormSubmit}>
        <label>表示名:</label>
        <input value={value} onChange={onChange} className="dark-input" />

        <label>メールアドレス:</label>
        <input {...getInputProps(emailField)} className="dark-input" />

        <label>パスワード:</label>
        <input type="password" {...getInputProps(passwordField)} className="dark-input" />

        <button type="submit" className="dark-button">Sign Up</button>
      </form>

      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <div style={{ marginBottom: "10px", color: "#888" }}>または</div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Login Failed")}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Signup;
