#!/usr/bin/env python3

from PIL import Image
from pathlib import Path
import sys

# EDIT THIS: Define your chapter page ranges based on page 10 (Table of Contents)
# Format: "Chapter Name": (start_page, end_page)
CHAPTERS = {
    "Chapter 1: Numbers": (15, 30),
    "Chapter 2: Addition": (31, 50),
    "Chapter 3: Subtraction": (51, 70),
    "Chapter 4: Multiplication": (71, 90),
    "Chapter 5: Division": (91, 110),
    "Chapter 6: Fractions": (111, 130),
    "Chapter 7: Decimals": (131, 150),
    "Chapter 8: Money": (151, 170),
    "Chapter 9: Time": (171, 190),
    "Chapter 10: Measurement": (191, 210),
    "Chapter 11: Geometry": (211, 230),
    "Chapter 12: Data Handling": (231, 248),
}

def create_chapter_pdf(pages_dir, chapter_name, start_page, end_page, output_dir):
    """Create a PDF from a range of pages"""
    pages_dir = Path(pages_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Sanitize chapter name for filename
    safe_name = chapter_name.replace(":", "-").replace(" ", "_")
    output_pdf = output_dir / f"{safe_name}.pdf"
    
    print(f"\nCreating: {chapter_name}")
    print(f"  Pages: {start_page} to {end_page}")
    
    # Collect images for this chapter
    images = []
    missing_pages = []
    
    for page_num in range(start_page, end_page + 1):
        page_file = pages_dir / f"page_{page_num:03d}.jpg"
        
        if not page_file.exists():
            missing_pages.append(page_num)
            continue
        
        try:
            img = Image.open(page_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)
        except Exception as e:
            print(f"  ✗ Error loading page {page_num}: {e}")
    
    if missing_pages:
        print(f"  ⚠ Missing pages: {missing_pages}")
    
    if not images:
        print(f"  ✗ No images found for this chapter")
        return False
    
    # Create PDF
    try:
        images[0].save(
            output_pdf,
            save_all=True,
            append_images=images[1:] if len(images) > 1 else [],
            resolution=100.0,
            quality=95,
            optimize=True
        )
        print(f"  ✓ Created: {output_pdf.name} ({len(images)} pages)")
        return True
    except Exception as e:
        print(f"  ✗ Error creating PDF: {e}")
        return False

def main():
    pages_dir = "./tmp/viva_class5_pages"
    output_dir = "./tmp/class5_chapters"
    
    print("=" * 70)
    print("ICSE Class 5 Mathematics - Chapter PDF Creator")
    print("=" * 70)
    print(f"\nSource: {pages_dir}")
    print(f"Output: {output_dir}")
    print(f"\nTotal chapters to create: {len(CHAPTERS)}")
    
    # Check if pages directory exists
    if not Path(pages_dir).exists():
        print(f"\n✗ Error: Pages directory not found: {pages_dir}")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    
    # Create PDF for each chapter
    success_count = 0
    for chapter_name, (start_page, end_page) in CHAPTERS.items():
        if create_chapter_pdf(pages_dir, chapter_name, start_page, end_page, output_dir):
            success_count += 1
    
    print("\n" + "=" * 70)
    print(f"\n✓ Successfully created {success_count}/{len(CHAPTERS)} chapter PDFs")
    print(f"\nChapter PDFs saved in: {output_dir}")
    print("\nNOTE: Please edit the CHAPTERS dictionary in this script")
    print("      with the actual page ranges from page 10 (Table of Contents)")
    print("=" * 70)

if __name__ == "__main__":
    main()

