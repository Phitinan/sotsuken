import useField from "../hooks/useField";
import useLogin from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const email = useField("email");
  const password = useField("password");

  const { login, error } = useLogin("/api/users/login");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:4000/api/goog/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save the user data and token
      localStorage.setItem("user", JSON.stringify(data));
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await login({ email: email.value, password: password.value });
    if (!error) {
      console.log("success");
      setIsAuthenticated(true);
      navigate("/");
    }
  };


  return (
    <div className="page-content">
      <div className="create">
        <h2>ログイン</h2>
        <form onSubmit={handleFormSubmit}>
          <label>メールアドレス:</label>
          <input {...email} className="dark-input" />

          <label>パスワード:</label>
          <input type="password" {...password} className="dark-input" />
          <button className="dark-button">Login</button>
        </form>
      </div>

      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <div style={{ marginBottom: "10px", color: "#888" }}>または</div>
        <GoogleLogin 
          onSuccess={handleGoogleSuccess} 
          onError={() => console.log("Login Failed")}
          text="signin_with" 
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>

  );
};

export default Login;