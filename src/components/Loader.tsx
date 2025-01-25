import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <span className="dot-wave">
        <span className="dot-wave__dot" />
        <span className="dot-wave__dot" />
        <span className="dot-wave__dot" />
      </span>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.span`
  display: inline-block;
  margin-left: 3px;

  .dot-wave {
    --uib-size: 20px;
    --uib-speed: 1s;
    --uib-color: #5e5e5e;
    display: inline-flex;
    align-items: center;
    justify-content: space-evenly;
    width: calc(var(--uib-size) * 1);
    height: calc(var(--uib-size) * 0.13);
    padding-top: calc(var(--uib-size) * 0.34);
  }

  .dot-wave__dot {
    flex-shrink: 0;
    width: calc(var(--uib-size) * 0.17);
    height: calc(var(--uib-size) * 0.17);
    border-radius: 50%;
    background-color: var(--uib-color);
    will-change: transform;
  }

  .dot-wave__dot:nth-child(1) {
    animation: jump824 var(--uib-speed) ease-in-out
      calc(var(--uib-speed) * -0.45) infinite;
  }

  .dot-wave__dot:nth-child(2) {
    animation: jump824 var(--uib-speed) ease-in-out
      calc(var(--uib-speed) * -0.3) infinite;
  }

  .dot-wave__dot:nth-child(3) {
    animation: jump824 var(--uib-speed) ease-in-out
      calc(var(--uib-speed) * -0.15) infinite;
  }

  @keyframes jump824 {
    0%,
    100% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(-100%);
    }
  }
`;

export default Loader;
