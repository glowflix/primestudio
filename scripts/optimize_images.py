#!/usr/bin/env python3
"""
Optimize images for mobile performance
Converts to WebP with aggressive compression
Target: max 300-400KB per image (from 2-3MB)
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuration
INPUT_DIR = Path(__file__).parent.parent / "public" / "images"
OUTPUT_DIR = INPUT_DIR  # Overwrite originals
QUALITY = 65  # 1-100, lower = smaller file, 65 is sweet spot for mobile
MAX_WIDTH = 2000  # Prevent excessive resolution
MAX_HEIGHT = 2000
TARGET_SIZE_MB = 0.4  # 400 KB target

def get_image_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def optimize_image(input_path, output_path, target_quality=65):
    """
    Optimize image with aggressive compression
    Returns: (success, original_size_mb, new_size_mb)
    """
    try:
        original_size = get_image_size_mb(input_path)
        print(f"\n📸 Processing: {input_path.name}")
        print(f"   Original: {original_size:.2f} MB")
        
        # Open and resize
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if necessary (WebP can have quality issues with alpha)
        if img.mode in ('RGBA', 'P'):
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Resize if too large
        if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
            print(f"   Resized to: {img.width}x{img.height}")
        
        # Save as WebP with compression
        img.save(output_path, 'WEBP', quality=target_quality, method=6)
        
        new_size = get_image_size_mb(output_path)
        reduction = ((original_size - new_size) / original_size) * 100
        
        print(f"   ✅ Compressed: {new_size:.2f} MB ({reduction:.1f}% reduction)")
        print(f"   Quality: {target_quality}/100")
        
        # Check if we need more aggressive compression
        if new_size > TARGET_SIZE_MB and target_quality > 45:
            print(f"   ⚠️  Still {new_size:.2f}MB (target {TARGET_SIZE_MB:.2f}MB), retrying with lower quality...")
            return optimize_image(input_path, output_path, target_quality - 10)
        
        return True, original_size, new_size
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False, 0, 0

def main():
    """Main optimization loop"""
    if not INPUT_DIR.exists():
        print(f"❌ Directory not found: {INPUT_DIR}")
        sys.exit(1)
    
    print(f"🚀 Image Optimization Script")
    print(f"📁 Input:  {INPUT_DIR}")
    print(f"🎯 Target: Max {TARGET_SIZE_MB:.2f} MB per image")
    print(f"📊 Quality: {QUALITY}/100 (aggressive for mobile)")
    print("=" * 60)
    
    # Find all WebP and JPG files
    image_files = list(INPUT_DIR.glob("*.webp")) + list(INPUT_DIR.glob("*.jpg")) + list(INPUT_DIR.glob("*.jpeg"))
    
    if not image_files:
        print("❌ No images found!")
        sys.exit(1)
    
    print(f"Found {len(image_files)} images to optimize\n")
    
    total_original = 0
    total_optimized = 0
    success_count = 0
    
    for image_path in sorted(image_files):
        output_path = OUTPUT_DIR / f"{image_path.stem}.webp"
        success, orig_mb, new_mb = optimize_image(image_path, output_path, QUALITY)
        
        if success:
            total_original += orig_mb
            total_optimized += new_mb
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Optimization Complete!")
    print(f"📊 Summary:")
    print(f"   Successfully processed: {success_count}/{len(image_files)}")
    print(f"   Total original size:    {total_original:.2f} MB")
    print(f"   Total optimized size:   {total_optimized:.2f} MB")
    print(f"   Total reduction:        {((total_original - total_optimized) / total_original * 100):.1f}%")
    print(f"   Average per image:      {total_optimized / success_count:.2f} MB")
    print("\n🎉 Ready to deploy with optimized images!")

if __name__ == "__main__":
    main()
