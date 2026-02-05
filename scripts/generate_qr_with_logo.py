from __future__ import annotations

import math
from pathlib import Path

import qrcode
from PIL import Image
from PIL import ImageFilter


def _make_logo_black_keep_alpha(img: Image.Image) -> Image.Image:
    """Convert any non-transparent pixels to solid black, preserving alpha."""
    rgba = img.convert("RGBA")
    r, g, b, a = rgba.split()
    black = Image.new("L", rgba.size, 0)
    return Image.merge("RGBA", (black, black, black, a))


def _dilate_mask(mask: Image.Image, *, radius_px: int) -> Image.Image:
    """Expand an alpha mask by ~radius_px using MaxFilter (fast dilation)."""
    if radius_px <= 0:
        return mask

    # MaxFilter uses odd kernel sizes.
    kernel = max(3, radius_px * 2 + 1)
    if kernel % 2 == 0:
        kernel += 1
    return mask.filter(ImageFilter.MaxFilter(kernel))


def generate_qr(
    *,
    url: str,
    logo_path: Path,
    output_path: Path,
    size_px: int = 1024,
    logo_frac: float = 0.18,
    quiet_zone_modules: int = 4,
) -> None:
    """Generate a high-contrast QR code with a centered logo.

    - QR: black on white, error correction H
    - Logo: converted to black, kept transparent
    - Logo sits on a white rounded rectangle "plate" to preserve QR readability
    """

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=quiet_zone_modules,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Render with uniform module size (avoid post-resize distortions)
    modules_total = qr.modules_count + quiet_zone_modules * 2
    module_px = max(8, size_px // modules_total)
    qr_img_raw = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    # qr_img_raw is sized (modules_total * 10) because box_size=10; rescale to module_px
    qr_img = qr_img_raw.resize((modules_total * module_px, modules_total * module_px), Image.NEAREST)

    # Center on a fixed white canvas (exact size_px x size_px)
    canvas = Image.new("RGBA", (size_px, size_px), (255, 255, 255, 255))
    offset_x = (size_px - qr_img.width) // 2
    offset_y = (size_px - qr_img.height) // 2
    canvas.alpha_composite(qr_img, (offset_x, offset_y))

    # Load and normalize logo
    # Keep transparency; use black fill for best contrast on QR.
    logo = Image.open(logo_path).convert("RGBA")
    logo = _make_logo_black_keep_alpha(logo)

    # Compute logo size
    target_logo_w = int(size_px * logo_frac)
    scale = target_logo_w / logo.width
    target_logo_h = max(1, int(logo.height * scale))
    logo = logo.resize((target_logo_w, target_logo_h), Image.LANCZOS)

    # "Knockout" a clean white area under the logo instead of drawing a visible plate.
    # This keeps the logo background visually transparent while preserving scan reliability.
    cx = cy = size_px // 2
    logo_x = cx - logo.width // 2
    logo_y = cy - logo.height // 2
    logo_x = int(round(logo_x / module_px) * module_px)
    logo_y = int(round(logo_y / module_px) * module_px)

    alpha = logo.split()[-1]
    # Expand a bit so QR modules don't visually collide with the mark.
    expand_px = max(module_px, module_px * 2)
    knockout_mask = _dilate_mask(alpha, radius_px=expand_px)

    knockout_patch = Image.new("RGBA", (logo.width, logo.height), (255, 255, 255, 255))
    knockout_patch.putalpha(knockout_mask)

    out = canvas
    out.alpha_composite(knockout_patch, (logo_x, logo_y))
    out.alpha_composite(logo, (logo_x, logo_y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG", optimize=True)


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    url = "https://www.primestudios.store"
    logo_path = project_root / "public" / "qr" / "logo pro.png"
    output_path = project_root / "public" / "qr" / "primestudios-store-logo.png"

    generate_qr(url=url, logo_path=logo_path, output_path=output_path)
    print(str(output_path))
