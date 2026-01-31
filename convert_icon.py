from PIL import Image
import os

def convert_png_to_ico(png_path, ico_path):
    img = Image.open(png_path)
    # Sizes common for Windows icons
    icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (255, 255)]
    img.save(ico_path, sizes=icon_sizes)

if __name__ == "__main__":
    convert_png_to_ico('static/img/broom.png', 'static/img/broom.ico')
    print("Converted broom.png to broom.ico")
