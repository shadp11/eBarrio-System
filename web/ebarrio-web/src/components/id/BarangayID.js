import ReactDOM from "react-dom/client";
import BrgyIDBack from "../../assets/brgyidback.png";
import BrgyIDFront from "../../assets/brgyidfront.png";

const BarangayID = ({ resData, captainData }) => {
  const printContent = (
    <div id="printContent">
      <div className="id-page">
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: "32px",
            width: "95px",
            height: "10px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.brgyID[0]?.idNumber}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "75px",
            left: "10px",
            width: "91px",
            height: "85px",
            display: "flex",
            border: "1px solid black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            alt="ID"
            style={{ width: "100%", height: "100%" }}
            src={resData.picture}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "160px",
            left: "13px",
            width: "70px",
            height: "23px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            alt="Signature"
            style={{ width: "100%", height: "100%" }}
            src={resData.signature}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "165px",
            left: "287px",
            width: "35px",
            height: "36px",
            border: "1px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            alt="QR"
            style={{ width: "100%", height: "100%" }}
            src={resData.brgyID[0]?.qrCode}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "82px",
            left: "118px",
            width: "190px",
            height: "18px",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: "bold",
            }}
          >
            {resData.middlename
              ? `${resData.lastname}, ${
                  resData.firstname
                }, ${resData.middlename.substring(0, 1)}.`
              : `${resData.lastname}, ${resData.firstname}`}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "105px",
            left: "118px",
            width: "60px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.birthdate}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "105px",
            left: "198px",
            width: "60px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.sex}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "125px",
            left: "118px",
            width: "70px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.civilstatus}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "125px",
            left: "198px",
            width: "68px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.nationality}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "125px",
            left: "268px",
            width: "40px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.precinct ? resData.precinct : "N/A"}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "148px",
            left: "118px",
            width: "190px",
            height: "13px",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.householdno?.address}
          </p>
        </div>

        <img alt="Barangay ID Front" className="id-img" src={BrgyIDFront} />
      </div>
      <div className="id-page">
        <div
          style={{
            position: "absolute",
            top: "240px",
            left: "10px",
            width: "158px",
            height: "70px",
            paddingLeft: "5px",
            paddingRight: "5px",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              textAlign: "center",
            }}
          >
            {resData.emergencyname}
          </p>
          <p
            style={{
              fontSize: "10px",
              textAlign: "center",
            }}
          >
            {resData.emergencyaddress}
          </p>
          <p
            style={{
              fontSize: "9px",
              textAlign: "center",
            }}
          >
            {resData.emergencymobilenumber}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "320px",
            width: "158px",
            left: "10px",
            height: "55px",
            paddingLeft: "5px",
            paddingRight: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <img
            alt="Signature"
            style={{
              position: "absolute",
              width: "50px",
              height: "50px",
            }}
            src={captainData.resID.signature}
          />
          <p
            style={{
              fontSize: "9px",
              textAlign: "center",
            }}
          >
            {captainData.resID.firstname} {captainData.resID.lastname}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "388px",
            width: "70px",
            left: "214px",
            display: "flex",
          }}
        >
          <p
            style={{
              fontSize: "8px",
            }}
          >
            {resData.brgyID[0]?.expirationDate}
          </p>
        </div>

        <img alt="Barangay ID Back" className="id-img" src={BrgyIDBack} />
      </div>
    </div>
  );

  const printDiv = document.createElement("div");
  document.body.appendChild(printDiv);

  const root = ReactDOM.createRoot(printDiv);
  root.render(printContent);

  const printStyle = document.createElement("style");
  printStyle.innerHTML = `
          @page {
            size: 86mm 54mm;
            margin: 0;
          }
    
         @media screen {
          #printContent, #printContent * {
            display: none;
          }
        }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 86mm !important;
              height: 54mm !important;
              overflow: hidden !important;
            }
    
            body * {
              visibility: hidden;
            }
    
            #printContent, #printContent * {
              visibility: visible;
            }
    
            #printContent {
              position: absolute;
              top: 0;
              left: 0;
              width: 86mm;
              height: 54mm;
            }
    
            .id-page {
              width: 86mm;
              height: 54mm;
              overflow: hidden;
              margin: 0;
              padding: 0;
              page-break-after: avoid;
            }
    
            .id-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
    
        `;

  document.head.appendChild(printStyle);

  window.onafterprint = () => {
    document.body.removeChild(printDiv);
    document.head.removeChild(printStyle);
  };

  setTimeout(() => {
    window.print();
  }, 3000);

  return null;
};

export default BarangayID;
