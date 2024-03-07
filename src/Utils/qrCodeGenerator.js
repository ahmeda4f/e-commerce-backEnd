import QRCode from "qrcode";

export async function generateQrCode(data) {
  const qrCode = await QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
  });
  return qrCode;
}
