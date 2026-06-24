import ReactDOM from "react-dom/client";
import EmployeeIDFront from "../../assets/employeeidfront.png";
import EmployeeIDBack from "../../assets/employeeidback.png";

const EmployeeID = ({ empData, captainData }) => {
  const printContent = (
    <div id="printContent">
      <div className="id-page">
        <div
          style={{
            position: "absolute",
            top: "65px",
            left: "60px",
            width: "80px",
            height: "75px",
          }}
        >
          <img
            style={{ width: "100%", height: "100%" }}
            src={empData.resID.picture}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: "150px",
            left: "28px",
            width: "150px",
            height: "40px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {empData.resID.middlename
              ? `${
                  empData.resID.firstname
                } ${empData.resID.middlename.substring(0, 1)}. ${
                  empData.resID.lastname
                }`
              : `${empData.resID.firstname} ${empData.resID.lastname}`}
          </p>
          <p style={{ fontSize: "11px", textAlign: "center" }}>
            {empData.position}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "220px",
            left: "41px",
            width: "40px",
            height: "40px",
          }}
        >
          <img
            style={{ width: "100%", height: "100%" }}
            src={empData.employeeID[0]?.qrCode}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "266px",
            left: "41px",
            width: "70px",
            height: "10px",
          }}
        >
          <p style={{ fontSize: "8px" }}>{empData.resID.brgyID[0]?.idNumber}</p>
        </div>
        <img className="id-img" src={EmployeeIDFront} />
      </div>
      <div className="id-page">
        <div
          style={{
            position: "absolute",
            top: "467px",
            left: "30px",
            width: "150px",
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <img
            style={{
              position: "absolute",
              width: "80px",
              height: "80px",
            }}
            src={captainData.resID.signature}
          />
          <p
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {captainData.resID.firstname} {captainData.resID.lastname}
          </p>
        </div>
        <img className="id-img" src={EmployeeIDBack} />
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
                    size: 54mm 86mm;
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
                      width: 54mm !important;
                      height: 86mm !important;
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
                      width: 54mm;
                      height: 86mm;
                    }
            
                    .id-page {
                      width: 54mm;
                      height: 86mm;
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

export default EmployeeID;
