"""生成分享二维码 PNG。
用法: python make_qr.py <url> [输出文件名]
默认输出到脚本同级目录 share-qr.png
"""
import sys
import os
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont

url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
out = sys.argv[2] if len(sys.argv) > 2 else "share-qr.png"
base = os.path.dirname(os.path.abspath(__file__))
out_path = out if os.path.isabs(out) else os.path.join(base, out)

qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_H, box_size=12, border=2)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="#0b1220", back_color="#ffffff").convert("RGB")

# 上下留白 + 底部说明文字
W, H = img.size
pad_top, pad_bottom = 48, 96
canvas = Image.new("RGB", (W, H + pad_top + pad_bottom), "#ffffff")
canvas.paste(img, (0, pad_top))

draw = ImageDraw.Draw(canvas)
font = None
for candidate in (
    "C:/Windows/Fonts/msyhbd.ttc",
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
):
    if os.path.exists(candidate):
        try:
            font = ImageFont.truetype(candidate, 26)
            break
        except Exception:
            pass

text = "扫码打开「我的系统」"
if font:
    tw = draw.textbbox((0, 0), text, font=font)[2]
    draw.text(((W - tw) / 2, H + pad_top + 20), text, fill="#0b1220", font=font)
else:
    draw.text((W / 2 - 90, H + pad_top + 26), text, fill="#0b1220")

canvas.save(out_path, "PNG")
print("QR saved:", out_path, canvas.size, "->", url)
