"""Offline QR creation from a configured production URL."""
from dataclasses import dataclass
from io import BytesIO

import qrcode
from reportlab.lib.utils import ImageReader


@dataclass(frozen=True)
class QrAsset:
    """A renderable QR image paired with the exact payload used to create it."""
    target: str
    image: ImageReader


def make_qr(url):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    image.save(buffer, format="PNG", optimize=False)
    buffer.seek(0)
    return QrAsset(target=url, image=ImageReader(buffer))
