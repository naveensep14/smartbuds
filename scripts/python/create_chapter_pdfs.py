#!/usr/bin/env python3

from PIL import Image
from pathlib import Path
import json

def show_page_10():
    """Display page 10 for reference"""
    page_10 = Path("./tmp/viva_class5_pages/page_010.jpg")
    if page_10.exists():
        try:
            img = Image.open(page_10)
            img.show()
            print("✓ Page 10 (Table of Contents) opened in your default image viewer")
        except:
            print("✗ Could not open page 10")
    else:
        print("✗ Page 10 not found")

def input_chapters():
    """Interactively input chapter information"""
    chapters = {}
    
    print("\n" + "=" * 70)
    print("Enter chapter information (leave chapter name empty to finish)")
    print("=" * 70)
    
    while True:
        print("\n" + "-" * 70)
        chapter_name = input("Chapter name (or press Enter to finish): ").strip()
        
        if not chapter_name:
            break
        
        try:
            start = int(input(f"  Start page for '{chapter_name}': "))
            end = int(input(f"  End page for '{chapter_name}': "))
            
            chapters[chapter_name] = (start, end)
            print(f"  ✓ Added: {chapter_name} (pages {start}-{end})")
        except ValueError:
            print("  ✗ Invalid page numbers, try again")
            continue
    
    return chapters

def load_chapters_from_file():
    """Load chapter definitions from JSON file"""
    chapters_file = Path("./tmp/chapters_class5.json")
    if chapters_file.exists():
        with open(chapters_file, 'r') as f:
            data = json.load(f)
            return {item['name']: (item['start'], item['end']) for item in data}
    return None

def save_chapters_to_file(chapters):
    """Save chapter definitions to JSON file for reuse"""
    chapters_file = Path("./tmp/chapters_class5.json")
    data = [
        {"name": name, "start": start, "end": end}
        for name, (start, end) in chapters.items()
    ]
    with open(chapters_file, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✓ Chapter definitions saved to: {chapters_file}")

def create_chapter_pdf(pages_dir, chapter_name, start_page, end_page, output_dir):
    """Create a PDF from a range of pages"""
    pages_dir = Path(pages_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Sanitize chapter name for filename
    safe_name = chapter_name.replace(":", "-").replace("/", "-").replace(" ", "_")
    output_pdf = output_dir / f"{safe_name}.pdf"
    
    print(f"\n  Creating: {chapter_name} (pages {start_page}-{end_page})")
    
    # Collect images for this chapter
    images = []
    
    for page_num in range(start_page, end_page + 1):
        page_file = pages_dir / f"page_{page_num:03d}.jpg"
        
        if not page_file.exists():
            continue
        
        try:
            img = Image.open(page_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)
        except Exception as e:
            print(f"    ✗ Error loading page {page_num}: {e}")
    
    if not images:
        print(f"    ✗ No images found")
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
        print(f"    ✓ Created: {output_pdf.name} ({len(images)} pages)")
        return True
    except Exception as e:
        print(f"    ✗ Error creating PDF: {e}")
        return False

def main():
    pages_dir = "./tmp/viva_class5_pages"
    output_dir = "./tmp/class5_chapters"
    
    print("=" * 70)
    print("ICSE Class 5 Mathematics - Chapter PDF Creator")
    print("=" * 70)
    
    # Check if pages directory exists
    if not Path(pages_dir).exists():
        print(f"\n✗ Error: Pages directory not found: {pages_dir}")
        return
    
    # Load chapter definitions from JSON file
    chapters = load_chapters_from_file()
    
    if not chapters:
        print("\n✗ Error: Could not load chapter definitions from tmp/chapters_class5.json")
        return
    
    print(f"\n✓ Loaded {len(chapters)} chapters from table of contents")
    
    # Create PDFs
    print("\n" + "=" * 70)
    print(f"Creating {len(chapters)} chapter PDFs...")
    print("=" * 70)
    
    success_count = 0
    for chapter_name, (start_page, end_page) in chapters.items():
        if create_chapter_pdf(pages_dir, chapter_name, start_page, end_page, output_dir):
            success_count += 1
    
    print("\n" + "=" * 70)
    print(f"✓ Successfully created {success_count}/{len(chapters)} chapter PDFs")
    print(f"\nOutput directory: {output_dir}")
    print("=" * 70)

if __name__ == "__main__":
    main()

