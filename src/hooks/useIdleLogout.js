import { useEffect } from "react";

export default function useIdleLogout(timeout = 60 * 1000) {
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) return;

        let timer;

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                console.warn("User idle — auto logging out...");
                localStorage.removeItem("access_token");

                setTimeout(() => {
                    window.location.replace("/");
                }, 50);
            }, timeout);
        };

        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            clearTimeout(timer);
            events.forEach((event) =>
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [timeout]);
}