# Mitra Images Directory

This directory contains images related to INA Trading's partners (Mitra).

## Directory Structure

```
mitra-images/
├── profile/         # Profile pictures of Mitra
├── products/        # Product images from Mitra
├── documents/       # Mitra-related documents and certificates
└── partners/        # Institutional partner logos (government, organizations)
```

## Image Guidelines

1. **File Formats**
   - Use `.jpg` or `.png` formats
   - Optimize images for web use
   - Maximum file size: 2MB

2. **Naming Convention**
   - Use lowercase letters
   - Use hyphens (-) instead of spaces
   - Include mitra-id in the filename
   - Format: `mitra-{id}-{type}-{index}.{extension}`
   - Example: `mitra-123-profile-1.jpg`
   
   For partner logos:
   - Keep original institution name in lowercase
   - Example: `kemendag.png`, `eximbank.png`

3. **Image Dimensions**
   - Profile pictures: 400x400px (1:1 ratio)
   - Product images: 800x600px (4:3 ratio)
   - Document scans: 1200x1600px (3:4 ratio)
   - Partner logos: Maintain original aspect ratio, max height 100px

4. **Organization**
   - Store profile pictures in the `profile/` subdirectory
   - Store product images in the `products/` subdirectory
   - Store documents in the `documents/` subdirectory
   - Store institutional partner logos in the `partners/` subdirectory

## Current Partner Logos

The following institutional partner logos are stored in the `partners/` directory:
- eximbank.png - Export-Import Bank
- iiyh.png
- kemendag.png - Ministry of Trade
- kemendes.png - Ministry of Village Affairs
- kemenkopukm.png - Ministry of Cooperatives and SMEs
- kemenperin.png - Ministry of Industry
- kementan.png - Ministry of Agriculture
- lpdb.png - LPDB
- matrik.png - Matrik
- peruri.png - Peruri

## Usage

When uploading images through the application:
1. Images will be automatically processed and stored in the appropriate subdirectory
2. Images will be automatically resized to the recommended dimensions
3. Original filenames will be converted to follow the naming convention

For partner logos:
1. Place new institutional partner logos in the `partners/` directory
2. Use lowercase filenames with the institution's name
3. Optimize the image for web use while maintaining quality
4. Ensure the logo is clearly visible when displayed at smaller sizes 