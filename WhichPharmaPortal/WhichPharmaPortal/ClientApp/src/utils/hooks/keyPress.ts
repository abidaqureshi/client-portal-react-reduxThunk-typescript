import { useState, useEffect } from "react";

export default function useKeyPress(targetKey: string, keyUp?: () => void) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);
  
    // If pressed key is our target key then set to true
    function downHandler({ key }: { key:string }) {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    }
  
    // If released key is our target key then set to false
    const upHandler = ({ key }: { key:string }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };
  
    // If released key is our target key then set to false
    const upCallbackHandler = ({ key }: { key:string }) => {
      if (key === targetKey) {
        keyUp && keyUp();
      }
    };

    // Add event listeners
    useEffect(() => {
      window.addEventListener('keydown', downHandler);
      window.addEventListener('keyup', upHandler);
      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener('keydown', downHandler);
        window.removeEventListener('keyup', upHandler);
      };
      // eslint-disable-next-line
    }, []); // Empty array ensures that effect is only run on mount and unmount
  
    useEffect(() => {
      window.addEventListener('keyup', upCallbackHandler);
      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener('keyup', upCallbackHandler);
      };
      // eslint-disable-next-line
    }, [keyUp]);

    return keyPressed;
}