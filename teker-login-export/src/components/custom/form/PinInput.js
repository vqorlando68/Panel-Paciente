import { useEffect, useState } from "react";

export default function PinInput({
  hideLabel = false,
  pinLength,
  codeValues,
  setCodeValues
}) {
  const resetValue = (index) => {
    setCodeValues((prevValues) =>
      prevValues.map((value, i) => (i >= index ? "" : value))
    );
  };

  const stepForward = (index) => {
    if (codeValues[index] && index !== pinLength - 1) {
      document.getElementById(`codefield_${index + 1}`).focus();
      setCodeValues((prevValues) =>
        prevValues.map((value, i) => (i === index + 1 ? "" : value))
      );
    }
  };

  const stepBack = (index) => {
    if (codeValues[index - 1] && index !== 0) {
      document.getElementById(`codefield_${index - 1}`).focus();
      setCodeValues((prevValues) =>
        prevValues.map((value, i) => (i === index - 1 ? "" : value))
      );
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();

    if (!e.clipboardData || index !== 0) return;

    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    const newValues = [...codeValues];

    pasteArray.forEach((value, i) => {
      if (index + i < pinLength) {
        newValues[index + i] = value;
      }
    });

    document.activeElement.blur();
    setCodeValues(newValues);
  };

  useEffect(() => {
    document.getElementById("codefield_0").focus();
  }, []);

  return (
    <div className="">
      {!hideLabel && (
        <p className="text-sky-950 text-lg font-medium">Introduzca el código</p>
      )}
      <div className=" grid grid-flow-col gap-6">
        {codeValues.map((value, i) => (
          <input
            key={`codefield_${i}`}
            autoFocus={i === 0}
            id={`codefield_${i}`}
            className="h-14 w-full p-4 font-medium text-center bg-white border border-gray-200 text-sky-950 rounded-2xl"
            value={value}
            maxLength="1"
            max="9"
            min="0"
            placeholder="-"
            inputMode="decimal"
            onChange={(e) => {
              setCodeValues((prevValues) =>
                prevValues.map((v, index) => (index === i ? e.target.value : v))
              );
            }}
            onKeyUp={(e) => {
              if (e.key === "v" || e.key === "Control") return;
              stepForward(i);
            }}
            onKeyDown={(e) => e.key === "Backspace" && stepBack(i)}
            onFocus={() => resetValue(i)}
            onPaste={(e) => handlePaste(e, i)}
          />
        ))}
      </div>
    </div>
  );
}
