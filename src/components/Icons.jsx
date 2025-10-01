import EnvelopeIcon from "../assets/icons/envelope.svg";
import EyeIcon from "../assets/icons/eye.svg";
import EyeOffIcon from "../assets/icons/eye-slash.svg";


export const Icons = {
    Envelope: () => (
        <img
            src={EnvelopeIcon}
            alt="envelope"
            style={{ width: "30px", height: "30px" }}
        />),
    Eye: () => (
        <img
            src={EyeIcon}
            alt="envelope"
            style={{ width: "30px", height: "30px" }}
        />),

    EyeOff: () => (
        <img
            src={EyeOffIcon}
            alt="envelope"
            style={{ width: "30px", height: "30px" }}
        />),
};

