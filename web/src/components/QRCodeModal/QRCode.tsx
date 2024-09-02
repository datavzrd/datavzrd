import * as qrCode from "@zag-js/qr-code"
import { useMachine, normalizeProps } from "@zag-js/react"
import { getId } from "../../App";

interface QRCodeProps {
    link: string;
}

export default function QRCode({ link }: QRCodeProps) {
  const [state, send] = useMachine(
    qrCode.machine({
      id: getId(`QRCode`),
      value: link,
    }),
  )

  const api = qrCode.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()} className="qr-code">
      <svg {...api.getFrameProps()}>
        <path {...api.getPatternProps()} />
      </svg>
      <div {...api.getOverlayProps()}>
      </div>
    </div>
  )
}