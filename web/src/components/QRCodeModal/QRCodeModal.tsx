import './QRCodeModal.css'
import QRCode from './QRCode';
import { useEffect } from 'react';


interface QRCodeModalProps {
    showQR: boolean;
    setShowQR: React.Dispatch<React.SetStateAction<boolean>>;
    qrURL: string;
  }


export default function QRCodeModal({ showQR, setShowQR, qrURL }: QRCodeModalProps) {
    useEffect(() => {
        if (showQR) {
          document.body.classList.add('modal-open');
        }
        return () => {
          document.body.classList.remove('modal-open');
        };
      }, [showQR]);

    const handleQRCodeModalClose = () => {
        setShowQR(false);
    }

    return ( showQR ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="header-title">Share data
                <button className="modal-close" onClick={handleQRCodeModalClose}>X</button>
              </div>
            </div>
            <div className="modal-body">
              <QRCode link={qrURL} />
            </div>
          </div>
        </div>
      ) : null
    )
}