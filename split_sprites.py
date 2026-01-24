from PIL import Image, ImageOps
import os

# Source sprite sheet
source_path = "/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/cute_animals_sprites_1769231186370.png"
dest_dir = "/Users/nupurdashputre/Documents/my-portfolio/nupurad.github.io/images/"

def make_transparent(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    # Simple threshold for white background
    for item in datas:
        # Check if pixel is white-ish
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)
    img.putdata(newData)
    
    # Trim empty space
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

try:
    if not os.path.exists(source_path):
        print(f"Error: Source file not found: {source_path}")
        exit(1)

    # Load sprite sheet
    sprite_sheet = Image.open(source_path)
    width, height = sprite_sheet.size
    
    # Split into 4 quadrants (2x2 grid)
    # Assuming prompt order: Cat, Dog, Sheep, Fox
    # 1 2
    # 3 4
    
    mid_x = width // 2
    mid_y = height // 2
    
    # Crop quadrants
    cat_img = sprite_sheet.crop((0, 0, mid_x, mid_y))
    dog_img = sprite_sheet.crop((mid_x, 0, width, mid_y))
    sheep_img = sprite_sheet.crop((0, mid_y, mid_x, height))
    fox_img = sprite_sheet.crop((mid_x, mid_y, width, height))
    
    # Process transparency
    cat_img = make_transparent(cat_img)
    dog_img = make_transparent(dog_img)
    sheep_img = make_transparent(sheep_img)
    fox_img = make_transparent(fox_img)
    
    # Save
    cat_img.save(os.path.join(dest_dir, "animal-cat.png"))
    dog_img.save(os.path.join(dest_dir, "animal-dog.png"))
    sheep_img.save(os.path.join(dest_dir, "animal-sheep.png"))
    fox_img.save(os.path.join(dest_dir, "animal-fox.png"))
    
    print("Successfully split sprite sheet and updated animal images.")

except Exception as e:
    print(f"An error occurred: {e}")
