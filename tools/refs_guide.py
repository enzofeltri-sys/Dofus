"""Références visuelles d'un donjon (à regarder, jamais copier dans le jeu) : télécharge les images d'une page de guide
de dofuspourlesnoobs.com (captures en jeu, grandes illustrations des boss, schémas des sorts) dans un dossier à part.
Usage : python3 -I tools/refs_guide.py <page, ex. cimetiere-des-mastodontes> <dossier vide>
Le texte de la page (sorts des monstres et des boss, salles) est aussi enregistré : page.txt."""
import html, os, re, sys, urllib.request

page, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
base = 'https://www.dofuspourlesnoobs.com'
raw = urllib.request.urlopen(f'{base}/{page}.html', timeout=30).read().decode('utf-8', 'ignore')
body = re.sub(r'<script.*?</script>|<style.*?</style>', '', raw, flags=re.S)
open(os.path.join(out, 'page.txt'), 'w').write(re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', body))))
srcs = [s for s in dict.fromkeys(re.findall(r'src="(/uploads/[^"]+)"', raw)) if '/custom_themes/' not in s and not s.endswith('1426805183.png')]
for s in srcs:
    name = s.rsplit('/', 1)[-1]
    try:
        with urllib.request.urlopen(base + s, timeout=30) as r, open(os.path.join(out, name), 'wb') as f:
            f.write(r.read())
    except Exception as e:  # une image manquante n'arrête pas le reste
        print('échec', name, e)
print(len(srcs), 'images →', out)
