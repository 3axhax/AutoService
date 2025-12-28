import { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

interface SignatureInputProps {
  updateSignature: (signature: string) => void;
}

export const SignatureInput = ({ updateSignature }: SignatureInputProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        penColor: "black",
      });

      signaturePadRef.current.addEventListener("endStroke", () => {
        if (
          updateSignature &&
          signaturePadRef.current &&
          !signaturePadRef.current.isEmpty()
        ) {
          updateSignature(signaturePadRef.current.toDataURL("image/png"));
        }
      });
    }
    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, [updateSignature]);

  return (
    <div className={""}>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          backgroundColor: "white",
        }}
      />
    </div>
  );
};
