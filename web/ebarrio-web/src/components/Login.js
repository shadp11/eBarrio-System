import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//ICONS
import AppLogo from "../assets/applogo-darkbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const { sendOTP } = useContext(OtpContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const confirm = useConfirm();

  //Animation
  const [animateScale, setAnimateScale] = useState(false);
  const [animateMove, setAnimateMove] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [animateLoginPanel, setAnimateLoginPanel] = useState(false);

  useEffect(() => {
    setAnimateScale(false);
    setAnimateMove(false);
    setShowLoginPanel(false);
    setAnimateLoginPanel(false);

    const startScale = setTimeout(() => setAnimateScale(true), 50);
    const startMove = setTimeout(() => setAnimateMove(true), 2200);
    const showPanel = setTimeout(() => setShowLoginPanel(true), 3000);
    const animatePanel = setTimeout(() => setAnimateLoginPanel(true), 3200);

    return () => {
      clearTimeout(startScale);
      clearTimeout(startMove);
      clearTimeout(showPanel);
      clearTimeout(animatePanel);
    };
  }, [location.pathname]);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post(
        "/checkcredentials",
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      console.log(res.status);
      if (res.status === 200) {
        // try {
        //   await api.put(`/login/${username}`);
        //   setIsAuthenticated(true);
        // } catch (error) {
        //   console.log("Error logging in", error);
        // }
        if (res.data.message === "Credentials verified") {
          try {
            await api.put(`/login/${username}`);
            setIsAuthenticated(true);
          } catch (error) {
            console.log("Error logging in", error);
          }
          // try {
          //   const response = await api.get(`/getmobilenumber/${username}`);
          //   sendOTP(username, response.data);
          //   navigation("/otp", {
          //     state: {
          //       username: username,
          //       mobilenumber: response.data,
          //     },
          //   });
          // } catch (error) {
          //   console.log("Error getting mobile number", error);
          // }
        } else if (res.data.message === "Token verified successfully.") {
          navigation("/set-password", {
            state: {
              username: username,
            },
          });
        }
      }
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        confirm(response.data.message || "Something went wrong.", "failed");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        confirm("An unexpected error occurred.", "errordialog");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-z0-9_]/g, "");
    setUsername(filtered);
  };

  const handlePasswordChange = (e) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-zA-Z0-9!@\$%\^&\*\+#_]/g, "");
    setPassword(filtered);
  };

  return (
    <div className="login-container">
      {/* Logo */}
      <img
        src={AppLogo}
        alt="App Logo"
        className={`login-logo
          ${animateScale ? "scale-100 opacity-100" : "scale-50 opacity-0"}
          ${animateMove ? "translate-x-[-25vw]" : "translate-x-0"}
        `}
      />

      {/* Login panel */}
      {showLoginPanel && (
        <div
          className={`right-login-container
            ${
              animateLoginPanel
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }
          `}
        >
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="header-text">Welcome!</h1>
              <label className="text-[#808080] font-subTitle font-semibold">
                Please enter your credentials to log in.
              </label>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e)}
                  className="form-input w-full"
                  minLength={3}
                  maxLength={16}
                  required
                />
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e)}
                    className="form-input w-full"
                    minLength={8}
                    maxLength={64}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="eye-toggle"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? "Logging in..." : "Login"}
                </button>
                <a href="/forgot-password" className="login-forgot-btn">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
