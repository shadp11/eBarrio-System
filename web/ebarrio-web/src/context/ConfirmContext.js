import React, { createContext, useState, useContext } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import IDDialog from "../components/IDDialog";
import ConfirmRedDialog from "../components/ConfirmRedDialog";
import SuccessDialog from "../components/SuccessDialog";
import FailedDialog from "../components/FailedDialog";
import ErrorDialog from "../components/ErrorDialog";
import SuccessChangePassDialog from "../components/SuccessChangePassDialog";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    message: "",
    isOpen: false,
    resolve: () => {},
    reject: () => {},
    dialogType: "confirm", // "confirm" or "id"
  });

  // Function to trigger the dialog based on the dialog type
  const confirm = (message, dialogType = "confirm") =>
    new Promise((resolve, reject) => {
      setConfirmState({
        message,
        isOpen: true,
        resolve,
        reject,
        dialogType, // Store the dialog type (confirm or id)
      });
    });

  const handleConfirm = () => {
    confirmState.resolve(true);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCancel = () => {
    confirmState.resolve(false);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleConfirm2 = (action) => {
    confirmState.resolve(action);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCancel2 = () => {
    confirmState.resolve("cancel");
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleSuccessConfirm = () => {
    confirmState.resolve("OK");
    setConfirmState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  const handleFailedConfirm = () => {
    confirmState.resolve("TRY AGAIN");
    setConfirmState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  const handleErrorConfirm = () => {
    confirmState.resolve("OK");
    setConfirmState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState.isOpen && confirmState.dialogType === "confirmred" && (
        <ConfirmRedDialog
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {confirmState.isOpen && confirmState.dialogType === "confirm" && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {confirmState.isOpen && confirmState.dialogType === "id" && (
        <IDDialog
          message={confirmState.message}
          onConfirm={handleConfirm2}
          onCancel={handleCancel2}
        />
      )}
      {confirmState.isOpen && confirmState.dialogType === "success" && (
        <SuccessDialog
          message={confirmState.message}
          onConfirm={handleSuccessConfirm}
        />
      )}

      {confirmState.isOpen && confirmState.dialogType === "failed" && (
        <FailedDialog
          message={confirmState.message}
          onConfirm={handleFailedConfirm}
        />
      )}

      {confirmState.isOpen && confirmState.dialogType === "errordialog" && (
        <ErrorDialog
          message={confirmState.message}
          onConfirm={handleErrorConfirm}
        />
      )}

      {confirmState.isOpen &&
        confirmState.dialogType === "successchangepass" && (
          <SuccessChangePassDialog message={confirmState.message} />
        )}
    </ConfirmContext.Provider>
  );
};
