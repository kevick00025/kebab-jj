import React from "react";

interface GuidesProps {
  x?: number[];
  y?: number[];
  width: number;
  height: number;
}

const Guides: React.FC<GuidesProps> = ({ x = [], y = [], width, height }) => {
  return (
    <>
      {/* Linee verticali */}
      {x.map((pos, i) => (
        <div
          key={"guide-x-" + i}
          style={{
            position: "absolute",
            left: pos,
            top: 0,
            width: 1,
            height: height,
            background: "#d7263d",
            opacity: 0.25,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Linee orizzontali */}
      {y.map((pos, i) => (
        <div
          key={"guide-y-" + i}
          style={{
            position: "absolute",
            top: pos,
            left: 0,
            width: width,
            height: 1,
            background: "#d7263d",
            opacity: 0.25,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
};

export default Guides;
