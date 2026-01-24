from PIL import Image
import os
import sys

# Source sprite sheet
source_path = "/Users/nupurdashputre/.gemini/antigravity/brain/844a04f2-fceb-4505-a739-d4ab8cea3e65/cute_animals_sprites_1769231186370.png"
dest_dir = "/Users/nupurdashputre/Documents/my-portfolio/nupurad.github.io/images/"

def make_transparent_flood(img, threshold=240):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Visited set
    visited = set()
    queue = []
    
    # Start from corners if they are white
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    for x, y in corners:
        r, g, b, a = pixels[x, y]
        if r > threshold and g > threshold and b > threshold:
            queue.append((x, y))
            visited.add((x, y))
            
    # Also Check entire perimeter just in case
    for x in range(width):
        for y in [0, height-1]:
            if (x,y) not in visited:
                r, g, b, a = pixels[x, y]
                if r > threshold and g > threshold and b > threshold:
                    queue.append((x, y))
                    visited.add((x, y))
                    
    for y in range(height):
        for x in [0, width-1]:
             if (x,y) not in visited:
                r, g, b, a = pixels[x, y]
                if r > threshold and g > threshold and b > threshold:
                    queue.append((x, y))
                    visited.add((x, y))

    # BFS Flood fill
    while queue:
        x, y = queue.pop(0)
        
        # Make transparent
        pixels[x, y] = (255, 255, 255, 0)
        
        # Neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    r, g, b, a = pixels[nx, ny]
                    # Check if "white-ish"
                    if r > threshold and g > threshold and b > threshold:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    return img

try:
    if not os.path.exists(source_path):
        print(f"Error: Source file not found: {source_path}")
        exit(1)

    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    # Load sprite sheet
    sprite_sheet = Image.open(source_path)
    width, height = sprite_sheet.size
    
    mid_x = width // 2
    mid_y = height // 2
    
    # 1 2
    # 3 4
    cat_img = sprite_sheet.crop((0, 0, mid_x, mid_y))
    dog_img = sprite_sheet.crop((mid_x, 0, width, mid_y))
    sheep_img = sprite_sheet.crop((0, mid_y, mid_x, height))
    fox_img = sprite_sheet.crop((mid_x, mid_y, width, height))
    
    # Process transparency with flood fill
    print("Processing Cat...")
    cat_img = make_transparent_flood(cat_img)
    print("Processing Dog...")
    dog_img = make_transparent_flood(dog_img)
    print("Processing Sheep...")
    sheep_img = make_transparent_flood(sheep_img)
    print("Processing Fox...")
    fox_img = make_transparent_flood(fox_img)
    
    # Save
    cat_img.save(os.path.join(dest_dir, "animal-cat.png"))
    dog_img.save(os.path.join(dest_dir, "animal-dog.png"))
    sheep_img.save(os.path.join(dest_dir, "animal-sheep.png"))
    fox_img.save(os.path.join(dest_dir, "animal-fox.png"))
    
    print("Successfully corrected transparency.")

except Exception as e:
    print(f"An error occurred: {e}")
