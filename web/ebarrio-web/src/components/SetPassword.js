import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//ICONS
import AppLogo from "../assets/applogo-darkbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const termsContent = {
  terms: [
    {
      title: "1. Eligibility",
      desc: "Only the authorized government personnel can avail of the services offered. By availing of the services, you declare that you have all the authorizations for accessing legal or official documents and atleast 18 years old.",
    },

    {
      title: "2. User Conduct",
      desc: (
        <>
          Being the authorized government or legal personnel, you will not use
          the platform as an unlawful or prohibited means such as but not
          limited to:
          <br />
          <ul className="list-disc pl-6 mt-2">
            <li>
              Tampering with official documents, legal records, or confidential
              information.
            </li>
            <li>Fraud or misrepresentation of any information.</li>
            <li>
              Influencing or interfering with a legal proceeding through the
              platform.
            </li>
            <li>
              Disqualification of Breach of Local, State, National, or
              International Laws.
            </li>
          </ul>
        </>
      ),
    },

    {
      title: "3. Intellectual Property",
      desc: "The entire platform, design, interface, database, legal records, and proprietary information are owned by eBarrio and are protected by the applicable laws. You may not reproduce, distribute, modify, or prepare derivative works from any content on the site without prior written consent from the relevant authority or governing body.",
    },
    {
      title: "4. Third-Party Services",
      desc: "The platform may have inbound hyperlinks to third-party websites or services, such as external legal databases or government services, which are not monitored or controlled by it. We shall not be liable for any content, privacy policies, or services offered by such third parties. Your acceptance of obligation as an official user is to review the terms and conditions and security measures regarding any third-party services you use.",
    },
    {
      title: "5. Disclaimer of Liability",
      desc: "The platform is designed to maintain accurate information on legal and government issues, but we give no warranty at all as to the accuracy, reliability, or completeness of the information. You understand that you are using the platform at your own risk. In that case, eBarrio and its officials are not liable for any damage or loss that arises out of your use or reliance upon the given information.",
    },
    {
      title: "6. Platform Availability",
      desc: "The platform may have some trouble working due to maintenance or other technical problems. eBarrio takes no responsibility for any unavailability but will make all reasonable efforts to restore service as soon as possible to minimize disruption to legal and governmental processes.",
    },
    {
      title: "7. Updates and Modifications",
      desc: "eBarrio reserves the right to modify, update, and discontinue any part of the platform, with or without prior notice at any time. Users will be notified of any updates or changes to these terms via e-mail or on the platform directly with no prior notifications. Access to and continued use of the platform is therefore taken as acceptance of the updated terms and conditions.",
    },
    {
      title: "8. Governing Law",
      desc: "Applicable National and International Statutes govern the terms and conditions as herein. Any disputes concerning or incidental to the use of this platform will be resolved following legal procedure, when applicable, within the concerned judicial authority.",
    },
    {
      title: "9. Termination",
      desc: "In the event you commit breach of these Terms of Services, misconduct, or abuse Your access to legal records or documents, eBarrio will keep for itself the right to suspend or terminate Your access to the platform. All rights conferred onto You will be withdrawn upon termination, and You must stop all actions upon the platform or any material related to it.",
    },
    {
      title: "10. Contact Information",
      desc: (
        <>
          If you have any questions or concerns regarding these terms and
          conditions or any problems in this regard pertaining to the delivery
          of support while accessing official legal records or services, please
          contact us at:
          <br />
          <ul className="list-disc pl-6 mt-2">
            <li>
              Email:{" "}
              <a href="">
                brgyaniban2bacoorcity@gmail.com
              </a>
            </li>
            <li>Telephone: 476-9397</li>
          </ul>
        </>
      ),
    },
  ],
};

const dataPrivacyContent = {
dataPrivacy : [
 
   {
    title:"1. Data Use",
    desc:("Your personal and official data will be used solely for the intended government and legal purposes outlined in this Privacy Policy. The data is used for functions such as document management, legal case processing, and communication with authorized parties. We will not share, sell, or disclose any personal or official information to third parties without explicit consent unless required by law or a legal obligation.")
  },
  {
    title:"2. Data Storage",
    desc:("All personal and organizational data collected will therefore be securely stored with their management within compliance with local laws and international laws on data protection. Strong encryption and access controls are employed to safeguard your information from unauthorized access.")
  },
{
    title:"3. Data Sharing",
    desc:("Your personal and official data may be shared with authorized personnel or service providers essential to fulfill legal services, including other government agencies or legal entities. In cases of legal necessity or emergency, your data may be shared with relevant authorities as required by law or government protocols. We will only share this information under these circumstances.")
  },
  {
    title:"4. Your Rights",
    desc:("As a user of government official data, you have access to the right of review, modification, and deleting information which you had submitted unless the obligation of such act is put upon us by any law or regulation. You can always reach us in the contact details given below should you wish to exercise any of the above rights or have questions or concerns regarding the accuracy and integrity of your data.")
  },
   {
    title:"5. Data Retention",
    desc:("The Company shall be entitled to retain any personal or official data as long as required to fulfill the purposes stated in this Privacy Policy or as otherwise required by applicable laws or regulations. If you stop availing of the platform, your personal and official data will be retained for the minimum time required in compliance with record retention policies, after which they will be securely erased or anonymized.")
  },
  {
    title:"6. Contact Information",
    desc: (
        <>
          If you have any questions or concerns regarding these privacy policies terms, please
          contact us at:
          <br />
          <ul className="list-disc pl-6 mt-2">
            <li>
              Email:{" "}
              <a href="">
                brgyaniban2bacoorcity@gmail.com
              </a>
            </li>
            <li>Telephone: 476-9397</li>
          </ul>
        </>
      ),
  },

]
}

function SetPassword() {
  const confirm = useConfirm();
  const location = useLocation();
  const { username } = location.state;
  const navigation = useNavigate();
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleSubmit = async () => {
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
      "Are you sure you want to set your password?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/resetpassword/${username}`, {
        password,
      });
      confirm(
        "Your password has been successfully created. You may now sign in with your new password.",
        "success"
      );
      navigation("/login");
    } catch (error) {
      console.log("Failed to reset password", error);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

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
    if (repassword && formattedVal !== repassword) {
      errors2.push("Passwords do not match!");
    }
    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRePassword(formattedVal);

    if (formattedVal !== password && formattedVal.length > 0) {
      errors.push("Passwords do not match.");
    }
    setRePasswordErrors(errors);
  };

  const closeTermsModal = () => {
    setTermsModalOpen(false);
  };

  const closePrivacyModal = () => {
    setPrivacyModalOpen(false);
  };

  return (
    <>
      <div className="login-container">
        <img
          src={AppLogo}
          alt="App Logo"
          className="w-[400px] h-[400px] absolute bottom-[-100px] left-[-90px]"
        />
        <div
          className="modal-container"
          style={{
            background: "none",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex flex-col bg-white rounded-xl shadow-lg p-8 w-[25rem] h-[27rem] justify-center items-center gap-8 overflow-y-auto hide-scrollbar">
              <div>
                <h1 className="header-text text-start">Set Password</h1>
                <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                  Enter password and confirm it to complete the reset process.
                </span>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => passwordValidation(e)}
                    className="form-input"
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

                <div className="relative w-full">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Enter confirm password"
                    value={repassword}
                    onChange={(e) => repasswordValidation(e)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((prev) => !prev)}
                    className="eye-toggle"
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <label className="text-[#808080] font-subTitle font-semibold text-[14px]">
                By clicking Set, you agree to eBarrio's{" "}
                <span
                  onClick={() => setTermsModalOpen(true)}
                  className="text-blue-500 cursor-pointer"
                >
                  Terms and Conditions
                </span>{" "}
                &{" "}
                <span
                  onClick={() => setPrivacyModalOpen(true)}
                  className="text-blue-500 cursor-pointer"
                >
                  Data Privacy
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
              >
                {loading ? "Setting..." : "Set"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal for Terms and Conditions */}
      {isTermsModalOpen && (
        <div className="modal-container">
          <div className="modal-form-confirm-container !overflow-hidden !max-h-[30rem]">
            <div className="flex justify-end w-full">
              <IoClose
                className="dialog-title-bar-icon"
                onClick={closeTermsModal}
              />
            </div>

            <h1 className="header-text">Terms and Conditions</h1>

            <div className="terms-content max-h-[35rem] overflow-y-auto mt-5">
              {termsContent.terms.map((item, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-Title font-bold text-[15] text-[#04384E]">
                    {item.title}
                  </h3>
                  <p className="font-subTitle font-medium text-[15px] text-justify text-[#04384E]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Data Privacy */}
      {isPrivacyModalOpen && (
        <div className="modal-container">
          <div className="modal-form-confirm-container !overflow-hidden !max-h-[30rem]">
            <div className="flex justify-end w-full">
              <IoClose
                className="dialog-title-bar-icon"
                onClick={closePrivacyModal}
              />
            </div>

            <h1 className="header-text">Data Privacy</h1>

            <div className="terms-content max-h-[35rem] overflow-y-auto mt-5">
              {dataPrivacyContent.dataPrivacy.map((item, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-Title font-bold text-[15] text-[#04384E]">
                    {item.title}
                  </h3>
                  <p className="font-subTitle font-medium text-[15px] text-justify text-[#04384E]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SetPassword;
