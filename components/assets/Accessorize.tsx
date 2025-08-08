import { styled } from "@mui/material";
import React, { MouseEventHandler} from "react";

const Wrapper = styled("div")({
    display: "flex",
    width: "60px",
    height: "60px",
    padding: "6.667px 6.666px 6.667px 6.667px",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "30px",
    cursor: "pointer",
    "@media (max-width: 580px)": {
        width: "32px",
        height: "32px",
        padding: "3.556px 3.555px 3.556px 3.556px"
    }
});

interface Props {
    isSelected: boolean;
    onClick: MouseEventHandler<HTMLDivElement> | undefined;
    isClickable: boolean;
}

const Accessorize: React.FC<Props> = ({ isSelected, isClickable, onClick }) =>(
        <Wrapper
        style={{
            background: isSelected ? "#3A55F8" : "#BFC1C7",
            cursor: "pointer",
        }}
        onClick={isClickable ? onClick : undefined}
        >
        <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="iconamoon:mouse-fill">
                <path
                    id="Vector"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.3906 18.1658C10.3906 14.5559 11.8246 11.0939 14.3772 8.54129C16.9298 5.98871 20.3918 4.55469 24.0017 4.55469C27.6116 4.55469 31.0737 5.98871 33.6262 8.54129C36.1788 11.0939 37.6128 14.5559 37.6128 18.1658V29.8325C37.6128 31.6199 37.2608 33.3898 36.5768 35.0412C35.8927 36.6926 34.8902 38.1931 33.6262 39.457C32.3623 40.7209 30.8619 41.7235 29.2105 42.4075C27.5591 43.0915 25.7892 43.4436 24.0017 43.4436C22.2143 43.4436 20.4444 43.0915 18.793 42.4075C17.1416 41.7235 15.6411 40.7209 14.3772 39.457C13.1133 38.1931 12.1107 36.6926 11.4267 35.0412C10.7427 33.3898 10.3906 31.6199 10.3906 29.8325V18.1658ZM25.9462 14.2769C25.9462 13.7612 25.7413 13.2666 25.3767 12.902C25.012 12.5373 24.5174 12.3325 24.0017 12.3325C23.486 12.3325 22.9915 12.5373 22.6268 12.902C22.2622 13.2666 22.0573 13.7612 22.0573 14.2769V22.0547C22.0573 22.5704 22.2622 23.065 22.6268 23.4296C22.9915 23.7943 23.486 23.9991 24.0017 23.9991C24.5174 23.9991 25.012 23.7943 25.3767 23.4296C25.7413 23.065 25.9462 22.5704 25.9462 22.0547V14.2769Z"
                    fill="white"
                />
            </g>
        </svg>
    </Wrapper>
)

export default Accessorize;
