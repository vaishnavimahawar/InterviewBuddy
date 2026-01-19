// src/components/cursor-trail.jsx

import React, { useEffect, useRef } from "react";

const CursorTrail = () => {
  const circlesRef = useRef([]);
  const coords = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  // The number of circles in the trail
  const circleCount = 18;

  useEffect(() => {
    const circles = circlesRef.current;
    if (circles.length === 0) return;
    
    // Initialize circles' custom properties for tracking
    circles.forEach((circle) => {
      circle.x = 0;
      circle.y = 0;
    });

    const handleMouseMove = (e) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animateCircles = () => {
      let { x, y } = coords.current;

      // Animate the trailing circles
      circles.forEach((circle, index) => {
        // The key fix: Position the circles directly using mouse coordinates.
        // Since their container is a full-screen overlay, this works perfectly.
        circle.style.left = x - 12 + "px";
        circle.style.top = y - 12 + "px";

        circle.style.transform = `scale(${(circles.length - index) / circles.length})`;

        circle.x = x;
        circle.y = y;

        // Easing logic to make the circles follow each other
        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      animationFrameId.current = requestAnimationFrame(animateCircles);
    };

    animateCircles();

    // Cleanup function runs on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <>
      {/* Self-contained CSS for the cursor effect */}
      <style>
        {`
          /* For the effect to work best, the page background should be set */
          body {
            background-color: white;
          }
          /* This is now a full-screen overlay container for the circles */
          .difference-cursor-container {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99999999;  
            mix-blend-mode: difference;
          }
          .difference-cursor-container .circle {
            position: absolute; /* Positioned relative to the container */
            display: block;
            width: 26px;
            height: 26px;
            border-radius: 20px;
            background-color: #fff;
          }
        `}
      </style>

      {/* The cursor container and the trailing circles */}
      <div className="difference-cursor-container">
        {Array.from({ length: circleCount }).map((_, i) => (
          <div
            key={i}
            className="circle"
            ref={(el) => (circlesRef.current[i] = el)}
          />
        ))}
      </div>
    </>
  );
};

export default CursorTrail;