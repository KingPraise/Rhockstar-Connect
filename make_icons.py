from PIL import Image

def make_square_icon(input_path, output_path, size):
    img = Image.open(input_path)
    # Convert to RGBA
    img = img.convert("RGBA")
    
    # Calculate aspect ratio
    aspect = img.width / img.height
    
    # Create a new blank (transparent) square image
    square_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    
    if aspect > 1:
        # wider than tall
        new_w = size
        new_h = int(size / aspect)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        square_img.paste(img, (0, (size - new_h) // 2), img)
    else:
        # taller than wide
        new_h = size
        new_w = int(size * aspect)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        square_img.paste(img, ((size - new_w) // 2, 0), img)
        
    square_img.save(output_path, "PNG")

make_square_icon('src/app/icon.png', 'public/icon-192x192.png', 192)
make_square_icon('src/app/icon.png', 'public/icon-512x512.png', 512)
print('Icons generated!')
