// src/components/Icons.jsx
import ContactBook from "../assets/icons/contact-book.svg";
import ContactBookActive from "../assets/icons/contact-book 1.svg";

import Dashboard from "../assets/icons/dashboard.svg";
import DashboardActive from "../assets/icons/dashboard 1.svg";

import ShoppingBag from "../assets/icons/shopping-bag.svg";
import ShoppingBagActive from "../assets/icons/shopping-bag 1.svg";

import Store from "../assets/icons/store.svg";
import StoreActive from "../assets/icons/store 1.svg";

import Logout from "../assets/icons/logout.svg";
import Settings from "../assets/icons/settings.svg";
import User from "../assets/icons/user 1.svg";

import EnvelopeIcon from "../assets/icons/envelope.svg";
import EyeIcon from "../assets/icons/eye.svg";
import EyeOffIcon from "../assets/icons/eye-slash.svg";

import SearchIcon from "../assets/icons/search.svg";

import Back from "../assets/icons/back.svg";

import BlueEye from "../assets/icons/eye 2.svg";
import BlueEyeOff from "../assets/icons/eye-slash 2.svg";

import AddPayment from "../assets/icons/add-payment.svg";

import Trash from "../assets/icons/trash.svg";
import Edit from "../assets/icons/edit.svg";
import Download from "../assets/icons/download.svg";

import Coin from "../assets/icons/coin.svg";
import Coins from "../assets/icons/coins.svg";
import Tag from "../assets/icons/tag.svg";
import Invoice from "../assets/icons/clipboard.svg";





const IconWrapper = ({ src, alt, size = 24 }) => (
    <img
        src={src}
        alt={alt}
        style={{ width: size, height: size, objectFit: "contain" }}
    />
);

export const Icons = {
    Envelope: (props) => <IconWrapper src={EnvelopeIcon} alt="envelope" {...props} />,
    Eye: (props) => <IconWrapper src={EyeIcon} alt="show password" {...props} />,
    EyeOff: (props) => <IconWrapper src={EyeOffIcon} alt="hide password" {...props} />,

    ContactBook: ({ active, ...props }) => (
        <IconWrapper src={active ? ContactBookActive : ContactBook} alt="contact book" {...props} />
    ),
    Dashboard: ({ active, ...props }) => (
        <IconWrapper src={active ? DashboardActive : Dashboard} alt="dashboard" {...props} />
    ),
    ShoppingBag: ({ active, ...props }) => (
        <IconWrapper src={active ? ShoppingBagActive : ShoppingBag} alt="shopping bag" {...props} />
    ),
    Store: ({ active, ...props }) => (
        <IconWrapper src={active ? StoreActive : Store} alt="store" {...props} />
    ),
    Settings: (props) => <IconWrapper src={Settings} alt="settings" {...props} />,
    Logout: (props) => <IconWrapper src={Logout} alt="logout" {...props} />,
    User: (props) => <IconWrapper src={User} alt="user" {...props} />,
    Search: (props) => <IconWrapper src={SearchIcon} alt="user" {...props} />,
    Back: (props) => <IconWrapper src={Back} alt="user" {...props} />,

    BlueEye: (props) => <IconWrapper src={BlueEye} alt="show password" {...props} />,
    BlueEyeOff: (props) => <IconWrapper src={BlueEyeOff} alt="hide password" {...props} />,

    AddPayment: (props) => <IconWrapper src={AddPayment} alt="add payment" {...props} />,

    Trash: (props) => <IconWrapper src={Trash} alt="delete" {...props} />,
    Edit: (props) => <IconWrapper src={Edit} alt="edit" {...props} />,
    Download: (props) => <IconWrapper src={Download} alt="download" {...props} />,

    Coin: (props) => <IconWrapper src={Coin} alt="gross income" {...props} />,
    Coins: (props) => <IconWrapper src={Coins} alt="net income" {...props} />,
    Tag: (props) => <IconWrapper src={Tag} alt="Items Sold" {...props} />,
    Invoice: (props) => <IconWrapper src={Invoice} alt="invoice" {...props} />,





};
