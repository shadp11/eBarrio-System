import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";
import { useConfirm } from "../context/ConfirmContext";

//ICONS
import { IoArrowBack } from "react-icons/io5";
import { RiQuestionnaireFill, RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AppLogo from "../assets/applogo-darkbg.png";

function ForgotPassword() {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState([]);
  const { sendOTP, verifyOTP } = useContext(OtpContext);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [isExisting, setIsExisting] = useState(false);
  const [isOTPClicked, setOTPClicked] = useState(false);
  const [isQuestionsClicked, setQuestionsClicked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [renewPassword, setReNewPassword] = useState("");
  const [OTP, setOTP] = useState("");
  const [securityquestion, setSecurityQuestion] = useState({
    question: "",
    answer: "",
  });
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (e) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-z0-9_]/g, "");
    setUsername(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "answer" ? value.toLowerCase() : value;
    setSecurityQuestion((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleQuestionsClicked = () => {
    if (
      Array.isArray(user.securityquestions) &&
      user.securityquestions.length === 0
    ) {
      confirm(
        "It appears that you have not yet set up your security questions.",
        "failed"
      );
      return;
    }
    setQuestionsClicked(true);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.get(`/checkuser/${username}`);
      setIsExisting(true);
      setUser(response.data);
      console.log(response.data);
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

  const handleQuestionVerify = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await api.post(`/verifyquestion/${username}`, { securityquestion });
      setIsVerified(true);
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

  const handleOTP = async () => {
    try {
      await api.get(`/checkotp/${username}`);
      if (resendCount === 3) {
        setIsResendDisabled(true);
        confirm("You can only resend OTP 3 times.", "failed");
        setOTPClicked(false);
        await api.get(`/limitotp/${username}`);
        return;
      }
      setOTPClicked(true);
      setResendCount((prevCount) => prevCount + 1);
      setResendTimer(30);
      sendOTP(username, user?.empID?.resID?.mobilenumber ?? user?.mobilenumber);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        confirm(
          "OTP usage is currently disabled. Please try again after 30 minutes.",
          "failed"
        );
      } else {
        console.error("Error checking OTP:", error);
      }
    }
  };

  const handleSuccessful = async () => {
    let hasErrors = false;
    if (passwordErrors.length !== 0) {
      hasErrors = true;
    }

    if (repasswordErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const isConfirmed = await confirm(
      "Are you sure you want to reset your password?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await api.post(`/newpassword/${username}`, { newPassword });
      confirm("Your password has been successfully reset.", "success");
      navigation("/login");
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

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");
    setNewPassword(formattedVal);

    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only.");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    if (renewPassword && formattedVal !== renewPassword) {
      errors2.push("Passwords do not match!");
    }
    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setReNewPassword(formattedVal);

    if (formattedVal !== newPassword && formattedVal.length > 0) {
      errors.push("Passwords do not match.");
    }
    setRePasswordErrors(errors);
  };

  useEffect(() => {
    if (!isOTPClicked || !isResendDisabled) return;
    let interval = null;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResendDisabled, isOTPClicked]);

  const handleResend = async () => {
    if (resendCount < 3) {
      try {
        sendOTP(
          username,
          user?.empID?.resID?.mobilenumber ?? user?.mobilenumber
        );
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
        console.log("New OTP is generated");
      } catch (error) {
        console.error("Error sending OTP:", error);
        confirm(
          "An error occurred while sending the OTP. Please try again.",
          "failed"
        );
      }
    } else {
      await api.get(`/limitotp/${username}`);
      confirm("You can only resend OTP 3 times.", "failed");
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyOTP(username, OTP);
      setIsVerified(true);
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        confirm(response.data.message || "Something went wrong.", "failed");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        confirm("An unexpected error occurred.", "errordialog");
      }
    }
  };

  useEffect(() => {
    if (isOTPClicked && OTP.length === 6) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [OTP, isOTPClicked]);

  const maskMobileNumber = (number) => {
    if (!number || number.length < 4) return number;
    const start = number.slice(0, 2);
    const end = number.slice(-2);
    const masked = "*".repeat(number.length - 4);
    return `${start}${masked}${end}`;
  };

  return (
    <>
      {/* First Design */}
      {/* Forgot Password */}
      {!isExisting && (
        <>
          <div className="login-container">
            <img
              src={AppLogo}
              alt="App Logo"
              className="login-logo translate-x-[-25vw]"
            />
            <div className="right-login-container">
              <div>
                <h1 className="header-text">Forgot Password</h1>
                <label className="text-[#808080] font-subTitle font-semibold">
                  Please enter your username to begin the password <br /> reset
                  process.
                </label>
              </div>

              <form
                className="flex flex-col gap-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e)}
                    className="form-input"
                    minLength={3}
                    maxLength={16}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                  >
                    {loading ? "Checking..." : "Continue"}
                  </button>
                  <a href="/login" className="login-forgot-btn">
                    Remember password?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Second Design */}
      {isExisting && (
        <>
          <div className="bg-blue-200">
            {/* Content */}
            {/* Reset Password */}
            {isVerified ? (
              <>
                <div className="login-container">
                  <img
                    src={AppLogo}
                    alt="App Logo"
                    className="w-[500px] h-[500px] absolute bottom-[-110px] left-[-90px]"
                  />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSuccessful();
                    }}
                  >
                    <div
                      className="modal-container"
                      style={{
                        background: "none",
                        backdropFilter: "none",
                        WebkitBackdropFilter: "none",
                      }}
                    >
                      <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 w-[25rem] h-[25rem] justify-center items-center">
                        <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                          <div>
                            <h1 className="header-text text-start">
                              Reset Password
                            </h1>
                            <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                              Enter your new password and confirm it to complete
                              the reset process.
                            </span>
                          </div>

                          <div className="flex flex-col gap-4 w-full">
                            <div>
                              <div className="relative w-full">
                                <input
                                  type={
                                    showResetNewPassword ? "text" : "password"
                                  }
                                  placeholder="New Password"
                                  onChange={(e) => passwordValidation(e)}
                                  className="form-input w-full"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowResetNewPassword((prev) => !prev)
                                  }
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                  tabIndex={-1}
                                >
                                  {showResetNewPassword ? (
                                    <FaEye />
                                  ) : (
                                    <FaEyeSlash />
                                  )}
                                </button>
                              </div>
                              {passwordErrors.length > 0 && (
                                <div style={{ width: 300 }}>
                                  {passwordErrors.map((error, index) => (
                                    <p
                                      key={index}
                                      className="text-red-500 font-semibold font-subTitle text-[14px]"
                                    >
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="relative w-full">
                                <input
                                  type={
                                    showConfirmNewPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm new password"
                                  onChange={(e) => repasswordValidation(e)}
                                  className="form-input w-full"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmNewPassword((prev) => !prev)
                                  }
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                  tabIndex={-1}
                                >
                                  {showConfirmNewPassword ? (
                                    <FaEye />
                                  ) : (
                                    <FaEyeSlash />
                                  )}
                                </button>
                              </div>
                              {repasswordErrors.length > 0 && (
                                <div style={{ marginTop: 5, width: 300 }}>
                                  {repasswordErrors.map((error, index) => (
                                    <p
                                      key={index}
                                      className="text-red-500 font-semibold font-subTitle text-[14px]"
                                    >
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
                          >
                            {loading ? "Resetting..." : "Reset"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            ) : /* One-Time Password */ isOTPClicked ? (
              <>
                <div className="login-container">
                  <img
                    src={AppLogo}
                    alt="App Logo"
                    className="w-[500px] h-[500px] absolute bottom-[-110px] left-[-90px]"
                  />
                  <div
                    className="modal-container"
                    style={{
                      background: "none",
                      backdropFilter: "none",
                      WebkitBackdropFilter: "none",
                    }}
                  >
                    <div className="flex flex-col bg-white rounded-xl shadow-lg px-5 py-10 w-[25rem] h-[25rem] ">
                      <IoArrowBack
                        className="text-2xl text-[#0E94D3]"
                        onClick={() => setOTPClicked(false)}
                      />
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            One-Time Password
                          </h1>
                          <div className="flex flex-col mt-4">
                            <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                              Enter the 6 digit code sent to:
                            </span>
                            <span className="text-navy-blue font-semibold">
                              {maskMobileNumber(
                                user?.empID?.resID?.mobilenumber ??
                                  user?.mobilenumber
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="w-full mt-10">
                          <OtpInput
                            value={OTP}
                            onChange={setOTP}
                            numInputs={6}
                            inputType="tel"
                            isInputNum
                            shouldAutoFocus
                            renderSeparator={<span>-</span>}
                            renderInput={(props) => (
                              <input
                                {...props}
                                className="w-full h-[60px] mx-2 text-lg text-center border border-gray-300 rounded-[10px] focus:outline-none bg-[#EBEBEB] font-medium"
                                style={{ maxWidth: "100%" }}
                              />
                            )}
                          />
                        </div>
                        {isResendDisabled ? (
                          <p className="text-[#808080] font-subTitle font-bold mt-5 text-end text-[14px]">
                            Resend OTP in{" "}
                            <span className="text-red-600">{resendTimer}</span>{" "}
                            second
                            {resendTimer !== 1 ? "s" : ""}
                          </p>
                        ) : (
                          <p
                            onClick={handleResend}
                            className="cursor-pointer mt-5 text-end text-[#0E94D3] font-subTitle font-bold text-[14px]"
                          >
                            Resend OTP
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : /* Security Questions */ isQuestionsClicked ? (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuestionVerify();
                  }}
                >
                  <div
                    className="login-container"
                    style={{
                      backgroundImage: `linear-gradient(to bottom,#0e94d3 0%,#0a70a0 50%,#095e86 75%,#074c6d 100%`,
                    }}
                  >
                    <img
                      src={AppLogo}
                      alt="App Logo"
                      className="w-[500px] h-[500px] absolute bottom-[-110px] left-[-90px]"
                    />
                    <div
                      className="modal-container"
                      style={{
                        background: "none",
                        backdropFilter: "none",
                        WebkitBackdropFilter: "none",
                      }}
                    >
                      <div className="flex flex-col bg-white rounded-xl p-6 shadow-lg px-5 py-10 w-[25rem] h-[27rem] ">
                        <IoArrowBack
                          className="text-2xl text-[#0E94D3]"
                          onClick={() => setQuestionsClicked(false)}
                        />
                        <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                          <div>
                            <h1 className="header-text text-start">
                              Security Questions
                            </h1>
                            <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                              To verify your identity, please answer the
                              security question below.
                            </span>
                          </div>
                          <div className="flex flex-col gap-4">
                            <select
                              onChange={handleInputChange}
                              className="form-input"
                              name="question"
                              required
                            >
                              <option value="" disabled selected hidden>
                                Select
                              </option>
                              {user.securityquestions?.map((element, index) => (
                                <option key={index} value={element.question}>
                                  {element.question}
                                </option>
                              ))}
                            </select>

                            <div className="relative w-full">
                              <input
                                type={
                                  showSecurityPassword ? "text" : "password"
                                }
                                placeholder="Answer"
                                name="answer"
                                onChange={handleInputChange}
                                className="form-input w-full"
                                required
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSecurityPassword((prev) => !prev)
                                }
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                tabIndex={-1}
                              >
                                {showSecurityPassword ? (
                                  <FaEye />
                                ) : (
                                  <FaEyeSlash />
                                )}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
                          >
                            {loading ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              /* Verification Method */
              <>
                <div className="login-container">
                  <img
                    src={AppLogo}
                    alt="App Logo"
                    className="w-[500px] h-[500px] absolute bottom-[-110px] left-[-90px]"
                  />
                  <div
                    className="modal-container"
                    style={{
                      background: "none",
                      backdropFilter: "none",
                      WebkitBackdropFilter: "none",
                    }}
                  >
                    <div className="flex flex-col bg-white rounded-xl shadow-lg px-5 py-10 w-[25rem] h-[25rem]">
                      <IoArrowBack
                        className="text-2xl text-[#0E94D3]"
                        onClick={() => setIsExisting(false)}
                      />
                      <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                        <div>
                          <h1 className="header-text text-start">
                            Verification Method
                          </h1>
                          <label className="text-[#808080] font-subTitle font-semibold text-[14px]">
                            Please choose a method to verify your identity and
                            continue resetting your password
                          </label>
                        </div>

                        <div className="flex flex-col gap-4">
                          <button
                            type="button"
                            onClick={handleOTP}
                            className="bg-[rgba(172,172,172,0.17)] p-4 rounded-md text-start flex flex-row items-center gap-x-4 border border-[#C1C0C0]"
                          >
                            <RiLockPasswordFill className="text-3xl text-navy-blue" />
                            <label className="text-navy-blue font-subTitle font-semibold">
                              One-Time Password (OTP)
                            </label>
                          </button>

                          <button
                            type="button"
                            onClick={handleQuestionsClicked}
                            className="bg-[rgba(172,172,172,0.17)] p-4 rounded-md text-start flex flex-row items-center gap-x-4 border border-[#C1C0C0]"
                          >
                            <RiQuestionnaireFill className="text-3xl text-navy-blue" />
                            <label className="text-navy-blue font-subTitle font-semibold">
                              Security Questions
                            </label>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ForgotPassword;
