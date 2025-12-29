"use client";
import { useEffect, useState } from "react";

function Typewriter({ text = "", speed = 50 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      if (index === text.length - 1) {
        
      }
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return displayedText;
}

export default Typewriter;