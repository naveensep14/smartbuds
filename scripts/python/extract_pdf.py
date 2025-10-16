#!/usr/bin/env python3

import sys
import os
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pypdf library"""
    try:
        reader = PdfReader(pdf_path)
        text_content = []
        
        print(f"PDF has {len(reader.pages)} pages")
        
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text.strip():  # Only add non-empty pages
                text_content.append(f"--- Page {page_num + 1} ---")
                text_content.append(page_text)
                text_content.append("")  # Add blank line between pages
        
        return "\n".join(text_content)
        
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

def main():
    pdf_path = "tmp/cemm101.pdf"
    
    if not os.path.exists(pdf_path):
        print("PDF file not found")
        sys.exit(1)
    
    print("Extracting text from PDF using pypdf...")
    print("=" * 50)
    
    extracted_text = extract_text_from_pdf(pdf_path)
    
    if extracted_text:
        print("Successfully extracted text:")
        print("=" * 50)
        print(extracted_text[:3000])  # Show first 3000 characters
        print("=" * 50)
        print(f"Total characters extracted: {len(extracted_text)}")
        
        # Save to file for further processing
        output_file = "cemm101_extracted_text.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(extracted_text)
        print(f"Full text saved to: {output_file}")
    else:
        print("Failed to extract text from PDF")

if __name__ == "__main__":
    main()

