import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  zIndex?: string;
  showCloseButton?: boolean;
}

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "", 
  zIndex = "z-[100]",
  showCloseButton = true 
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndex} bg-black/95 flex items-center justify-center p-4`}>
      <div className={`relative max-w-7xl max-h-full w-full h-full ${className}`}>
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-black/70 transition-all duration-300 group"
          >
            <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          </button>
        )}
        
        {/* Modal Content */}
        {children}
        
        {/* Click outside to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default Modal; 