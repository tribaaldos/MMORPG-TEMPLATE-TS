import { Canvas } from "@react-three/fiber";
import { useState, useEffect } from "react";

function EmojiCursor({ emoji = "😀" }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 9999,
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {emoji}
        </div >
    );
}
export default EmojiCursor;

import * as React from "react";


const StandardCursor = ({ width = "200px", height = "200px", ...props }) => (

    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-100 -100 700 700"   // ← aquí lo cambias
        width={width}
        height={height}
        fill="#050505"
        stroke="#050505"
        {...props}
    >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier"
            transform="rotate(290, 650, 380)"
        >
            <path
                style={{ fill: "#FFFFFF" }}
                d="M210.418,309.324l56.3,148.7l197.3-414l-414.4,197.5l152.7,59.6 
          C206.118,302.624,209.018,305.624,210.418,309.324z"
            />
            <path
                style={{ fill: "#3d0000" }}
                d="M343.418,132.824h23.9c7.8,0,14.1,6.3,14.1,14.1s-6.3,14.1-14.1,14.1h-83.1l-62.4,29.8h34.6 
          c7.8,0,14.1,6.3,14.1,14.1s-6.3,14.1-14.1,14.1h-87.6c-1.6,0-3.1-0.3-4.5-0.8l-43.7,20.8l109.5,42.7l39.5,104.4l134.6-282.4 
          L343.418,132.824z"
            />
            <path
                style={{ fill: "#8a0000" }}
                d="M503.918,4.124c-4.2-4.2-10.7-5.3-16-2.8l-479.9,228.8c-5.1,2.4-8.2,7.6-8,13.3 
          c0.2,5.6,3.7,10.6,9,12.6l177.3,69.2l65.7,173.7c2,5.3,7,8.9,12.6,9.1c0.2,0,0.4,0,0.6,0c5.4,0,10.4-3.1,12.7-8l228.7-479.8 
          C509.218,14.824,508.118,8.424,503.918,4.124z M266.718,458.024l-56.2-148.7c-1.4-3.7-4.3-6.7-8.1-8.2l-152.8-59.6l414.4-197.5 
          L266.718,458.024z"
            />
        </g>
    </svg>
);

export { StandardCursor };


const AnvilIcon = ({ width = "48px", height = "48px", color = "#000", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-1.6 -1.6 35.20 35.20"
        width={width}
        height={height}
        fill={color}
        stroke={color}
        strokeWidth="1.088"
        {...props}
    >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="#d7cccc"
            strokeWidth="4.992"
        >
            <title>anvil</title>
            <path d="M26.375 14.833c1.548-0.494 3.096-1.594 4.644-3.19-1.549-1.624-3.063-2.424-4.644-2.725v-2.263h-18.874v1.643h-6.355c1.146 3.109 3.659 5.252 6.355 5.985v2.68h4.97c-0.863 2.931-2.652 5.337-4.839 7.419h-1.878v1.644c-0.008 0.007-0.016 0.013-0.024 0.020h0.024v2.223h23.505v-3.886h-2.499c-2.444-2.080-4.177-4.484-4.984-7.419h4.599v-2.131z"></path>
        </g>
        <g id="SVGRepo_iconCarrier">
            <title>anvil</title>
            <path d="M26.375 14.833c1.548-0.494 3.096-1.594 4.644-3.19-1.549-1.624-3.063-2.424-4.644-2.725v-2.263h-18.874v1.643h-6.355c1.146 3.109 3.659 5.252 6.355 5.985v2.68h4.97c-0.863 2.931-2.652 5.337-4.839 7.419h-1.878v1.644c-0.008 0.007-0.016 0.013-0.024 0.020h0.024v2.223h23.505v-3.886h-2.499c-2.444-2.080-4.177-4.484-4.984-7.419h4.599v-2.131z"></path>
        </g>
    </svg>
);

export { AnvilIcon };
