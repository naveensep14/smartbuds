#!/usr/bin/env python3

import requests
from pathlib import Path
import sys
import json
from PIL import Image
import re

def get_page_count(base_url):
    """Try to determine the total page count"""
    config_url = f"{base_url}/mobile/javascript/config.js"
    try:
        response = requests.get(config_url, timeout=10)
        # Try to find totalPageCount in the response
        # We'll need to check the actual pages
        return None
    except:
        return None

def download_page_images(base_url, output_dir, max_pages=500):
    """Download all page images from the ebook"""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Construct page URLs (they're usually numbered 1.jpg, 2.jpg, etc.)
    page_urls = []
    downloaded_pages = []
    
    print(f"Downloading pages from: {base_url}")
    print(f"Saving to: {output_dir}")
    print("=" * 60)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    # Try downloading pages until we get a 404
    for page_num in range(1, max_pages + 1):
        # Try different formats: 1.jpg, 001.jpg, page1.jpg, etc.
        formats_to_try = [
            f"{page_num}.jpg",
            f"{page_num:03d}.jpg",
            f"{page_num}.png",
            f"page{page_num}.jpg",
        ]
        
        page_downloaded = False
        for page_format in formats_to_try:
            # Try both normal and large paths
            for path_type in ['files/mobile', 'files/large', 'files/page']:
                page_url = f"{base_url}/{path_type}/{page_format}"
                
                try:
                    response = requests.get(page_url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        # Save the page
                        output_file = output_dir / f"page_{page_num:03d}.jpg"
                        with open(output_file, 'wb') as f:
                            f.write(response.content)
                        
                        downloaded_pages.append(output_file)
                        print(f"✓ Downloaded page {page_num}")
                        page_downloaded = True
                        break
                    
                except Exception as e:
                    continue
            
            if page_downloaded:
                break
        
        # If we couldn't download this page, assume we've reached the end
        if not page_downloaded:
            if page_num == 1:
                print(f"✗ Could not download page 1. Check the URL structure.")
            else:
                print(f"\nReached end at page {page_num - 1}")
            break
    
    return downloaded_pages

def images_to_pdf(image_files, output_pdf):
    """Convert downloaded images to a single PDF"""
    if not image_files:
        print("No images to convert")
        return False
    
    try:
        # Open all images
        images = []
        for img_file in image_files:
            img = Image.open(img_file)
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)
        
        # Save as PDF
        if images:
            images[0].save(
                output_pdf,
                save_all=True,
                append_images=images[1:],
                resolution=100.0,
                quality=95,
                optimize=True
            )
            print(f"\n✓ Created PDF: {output_pdf}")
            return True
    except Exception as e:
        print(f"✗ Error creating PDF: {e}")
        return False

def main():
    # Parse command line arguments
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
        # Extract class number for output naming
        class_match = re.search(r'c(\d+)', base_url)
        class_num = class_match.group(1) if class_match else '5'
    else:
        # Default to Class 5
        base_url = "https://trp.vivadigitalindia.net/math/icse/c5/ebook"
        class_num = "5"
    
    # Check if we want Class 4 instead
    if len(sys.argv) > 2 and sys.argv[2] == '4':
        base_url = "https://trp.vivadigitalindia.net/math/icse/c4/ebook"
        class_num = "4"
    
    output_dir = f"./tmp/viva_class{class_num}_pages"
    output_pdf = f"./tmp/icse_class{class_num}_math.pdf"
    
    print("=" * 60)
    print(f"Viva ICSE Mathematics Class {class_num} Downloader")
    print("=" * 60)
    
    # Download all pages
    downloaded_pages = download_page_images(base_url, output_dir)
    
    if not downloaded_pages:
        print("\n✗ No pages were downloaded. The URL structure might be different.")
        print("\nTry opening the ebook in browser and check DevTools Network tab")
        print("to see the actual image URLs being loaded.")
        return
    
    print(f"\n✓ Successfully downloaded {len(downloaded_pages)} pages")
    
    # Convert to PDF
    print("\nConverting images to PDF...")
    if images_to_pdf(downloaded_pages, output_pdf):
        print(f"\n{'=' * 60}")
        print("SUCCESS!")
        print(f"{'=' * 60}")
        print(f"PDF saved: {output_pdf}")
        print(f"\nNext steps:")
        print(f"1. Extract text: python extract_pdf.py")
        print(f"2. Generate tests: python generate_real_class3_tests.py")
    else:
        print(f"\nImages saved in: {output_dir}")
        print("You can manually combine them or use OCR tools")

if __name__ == "__main__":
    main()

