from PIL import Image
import os

# Charger l'image
img = Image.open(r"C:\Users\vente\Desktop\CC HACK\licorne.JPG")
width, height = img.size

# L'image est 3x2 (3 colonnes, 2 lignes)
# Calculer les dimensions de chaque cellule
cell_width = width // 3
cell_height = height // 2

# Définir les zones de crop pour chaque licorne (sans le texte en bas)
# On prend environ 75% de la hauteur pour éviter le texte
crop_height = int(cell_height * 0.70)

output_dir = r"c:\Users\vente\Desktop\Documents\scrabble\CascadeProjects\windsurf-project\CascadeProjects\windsurf-project\images"

# Positions des 6 licornes
positions = [
    (0, 0),      # 0 - Normal
    (1, 0),      # 1 - Légèrement affaibli
    (2, 0),      # 2 - Un peu affaibli
    (0, 1),      # 3 - Affaibli
    (1, 1),      # 4 - Très affaibli
    (2, 1),      # 5 - À terre
]

for i, (col, row) in enumerate(positions):
    left = col * cell_width
    top = row * cell_height + 10  # Petit offset du haut
    right = left + cell_width
    bottom = top + crop_height
    
    # Découper
    cropped = img.crop((left, top, right, bottom))
    
    # Sauvegarder
    output_path = os.path.join(output_dir, f"unicorn-{i}.png")
    cropped.save(output_path, "PNG")
    print(f"Saved unicorn-{i}.png")

print("Done!")
