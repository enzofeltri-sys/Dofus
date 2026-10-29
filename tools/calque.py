"""Calque automatique d'une illustration de monstre (DofusDB, 128 px) en SVG (décision d'Enzo du 29/10 : jeu strictement privé).
Usage : <python avec vtracer> tools/calque.py <image.png> <sortie sans extension> [agrandissement=4] [couleurs=64]
L'image est retournée (le monstre regarde à gauche), l'ombre au sol est retirée, puis tracée en formes de couleur."""
import sys, os, vtracer
from PIL import Image, ImageFilter
src, out, scale, ncol = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4, int(sys.argv[4]) if len(sys.argv) > 4 else 64
im = Image.open(src).convert('RGBA').transpose(Image.FLIP_LEFT_RIGHT)
a = im.getchannel('A').point(lambda v: 255 if v >= 200 else 0)          # l'ombre au sol (semi-transparente) disparaît
big = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
amask = a.resize(big.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v >= 128 else 0)
rgb = big.convert('RGB').filter(ImageFilter.MedianFilter(3))
q = rgb.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
q = q.filter(ImageFilter.ModeFilter(3))
res = q.convert('RGBA'); res.putalpha(amask)
res.save(out + '.png')
vtracer.convert_image_to_svg_py(out + '.png', out + '.svg', colormode='color', hierarchical='stacked', mode='spline',
  filter_speckle=8, color_precision=6, layer_difference=6, corner_threshold=70, length_threshold=6.0, max_iterations=10, splice_threshold=45, path_precision=1)
print(os.path.basename(out), os.path.getsize(out + '.svg') // 1024, 'Ko')
