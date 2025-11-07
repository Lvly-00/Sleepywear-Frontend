import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function usePreFetchNavigate(fetchFn, getPathFn) {
    const [loadingId, setLoadingId] = useState(null);
    const navigate = useNavigate();

    const handleRowClick = async(item) => {
        try {
            setLoadingId(item.id);
            await fetchFn(item.id);
            navigate(getPathFn(item));
        } catch (err) {
            console.error("Pre-fetch error:", err);
        } finally {
            setLoadingId(null);
        }
    };

    return { loadingId, handleRowClick };
}