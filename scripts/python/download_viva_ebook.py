#!/usr/bin/env python3

import requests
from pathlib import Path
import sys
import re
from bs4 import BeautifulSoup

def download_ebook(url, output_path):
    """
    Attempt to download an ebook from Viva Digital
    """
    try:
        print(f"Attempting to download from: {url}")
        
        # Create tmp directory if it doesn't exist
        Path("./tmp").mkdir(exist_ok=True)
        
        # Set headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Check content type
        content_type = response.headers.get('content-type', '')
        print(f"Content type: {content_type}")
        
        if 'application/pdf' in content_type:
            # It's a PDF, save it directly
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"✓ PDF downloaded successfully to: {output_path}")
            return True
        elif 'text/html' in content_type:
            # It's HTML, parse it to find PDF or image links
            html_path = output_path.replace('.pdf', '.html')
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"✓ HTML content saved to: {html_path}")
            
            # Parse HTML to find ebook resources
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for PDF links
            pdf_links = []
            for link in soup.find_all(['a', 'iframe', 'embed', 'object']):
                href = link.get('href') or link.get('src') or link.get('data')
                if href and ('.pdf' in href.lower() or 'ebook' in href.lower()):
                    pdf_links.append(href)
            
            if pdf_links:
                print(f"\n✓ Found {len(pdf_links)} potential ebook link(s):")
                for i, link in enumerate(pdf_links, 1):
                    print(f"  {i}. {link}")
                    
                # Try to download the first PDF link
                first_link = pdf_links[0]
                if not first_link.startswith('http'):
                    # It's a relative URL, construct full URL
                    from urllib.parse import urljoin
                    first_link = urljoin(url, first_link)
                
                print(f"\n⟳ Attempting to download: {first_link}")
                pdf_response = requests.get(first_link, headers=headers, timeout=30)
                pdf_response.raise_for_status()
                
                with open(output_path, 'wb') as f:
                    f.write(pdf_response.content)
                print(f"✓ PDF downloaded successfully to: {output_path}")
                return True
            
            # Look for image-based ebook viewers
            images = soup.find_all('img')
            if images:
                print(f"\n✓ Found {len(images)} images (might be page images)")
                print("Note: This might be an image-based ebook viewer")
            
            # Look for JavaScript files that might load the ebook
            scripts = soup.find_all('script', src=True)
            print(f"\n✓ Found {len(scripts)} script files")
            for script in scripts[:5]:  # Show first 5
                print(f"  - {script.get('src')}")
            
            print("\nNote: This appears to be an HTML-based ebook viewer.")
            print("You may need to:")
            print("1. Open the URL in browser and use browser dev tools")
            print("2. Check the HTML file for embedded resources")
            print("3. Use browser Print → Save as PDF")
            return False
        else:
            print(f"Unknown content type: {content_type}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"Error downloading: {e}")
        return False

def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
        # Extract class number from URL for filename
        class_match = re.search(r'c(\d+)', url)
        class_num = class_match.group(1) if class_match else '4'
        output_path = f"./tmp/icse_class{class_num}_math.pdf"
    else:
        # Default URLs
        url = "https://trp.vivadigitalindia.net/math/icse/c5/ebook/index.html"
        output_path = "./tmp/icse_class5_math.pdf"
    
    print("=" * 60)
    print("Viva Digital Ebook Downloader")
    print("=" * 60)
    
    success = download_ebook(url, output_path)
    
    if success:
        print("\n✓ Ready to extract text using: python extract_pdf.py")
    else:
        print("\nNext steps:")
        print("1. Check the downloaded HTML file for clues")
        print("2. Open the URL in browser with DevTools")
        print("3. Try browser Print → Save as PDF")

if __name__ == "__main__":
    main()
