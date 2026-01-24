from PIL import Image
import os
import sys

files = [
    ("/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/cat_3d_cute_1769231212697.png", "animal-cat.png"),
    ("/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/dog_3d_cute_1769231226269.png", "animal-dog.png"),
    ("/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/sheep_3d_cute_1769231238624.png", "animal-sheep.png"),
    ("/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/fox_3d_cute_1769231250394.png", "animal-fox.png")
]

dest_dir = "/Users/nupurdashputre/Documents/my-portfolio/nupurad.github.io/images/"

print("Starting processing...")
try:
    for src, dest_name in files:
        if not os.path.exists(src):
            print(f"Source not found: {src}")
            continue
            
        print(f"Processing {src} to {dest_name}")
        img = Image.open(src).convert("RGBA")
        datas = img.getdata()
        newData = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        img.save(os.path.join(dest_dir, dest_name), "PNG")
        print(f"Saved {dest_name}")
except ImportError:
    print("PIL not installed. Copying files raw.")
    import shutil
    for src, dest_name in files:
        shutil.copy(src, os.path.join(dest_dir, dest_name))
except Exception as e:
    print(f"An error occurred: {e}")
