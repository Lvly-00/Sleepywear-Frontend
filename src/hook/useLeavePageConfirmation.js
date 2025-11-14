import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useLeavePageConfirmation(shouldBlock) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [nextLocation, setNextLocation] = useState(null);

    const confirmLeave = () => {
        setShowModal(false);
        if (nextLocation) {
            navigate(nextLocation.pathname, { replace: true });
        }
    };

    const stayHere = () => {
        setShowModal(false);
        setNextLocation(null);
    };

    // Browser refresh / tab close
    useEffect(() => {
        const handler = (e) => {
            if (!shouldBlock) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [shouldBlock]);

    return { showModal, confirmLeave, stayHere, setNextLocation };
}