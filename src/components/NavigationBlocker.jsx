import { useEffect } from "react";
import { useNavigate, UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import { useContext, useState, useCallback } from "react";

function NavigationBlocker({ when, onConfirmLeave, onCancelLeave, children }) {
  const { navigator } = useContext(NavigationContext);
  const [showModal, setShowModal] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx) => {
      if (confirmedNavigation) {
        unblock();
        tx.retry();
      } else {
        setShowModal(true);
        setLastLocation(tx.location);
      }
    });

    return unblock;
  }, [navigator, confirmedNavigation, when]);

  // Handler when user confirms leaving
  const confirmLeave = useCallback(() => {
    setShowModal(false);
    setConfirmedNavigation(true);
    if (onConfirmLeave) onConfirmLeave();
  }, [onConfirmLeave]);

  // Handler when user cancels leaving
  const cancelLeave = useCallback(() => {
    setShowModal(false);
    setLastLocation(null);
    setConfirmedNavigation(false);
    if (onCancelLeave) onCancelLeave();
  }, [onCancelLeave]);

  // Optional: Warn user on browser tab close/refresh
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);

  return (
    <>
      {children}
      {showModal && (
        <YourCancelModalComponent
          opened={showModal}
          onClose={cancelLeave}
          onConfirm={() => {
            confirmLeave();
            // navigate programmatically here if needed
          }}
        />
      )}
    </>
  );
}

export default NavigationBlocker;
