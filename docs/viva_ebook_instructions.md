# How to Download Viva Digital Ebook

## Method 1: Browser Developer Tools (Most Reliable)

1. **Open the ebook URL in Chrome/Firefox:**
   ```
   https://www.vivadigital.in/vupload/resource/subject-MATHEMATICS/series-ICSE%20MATHEMATICS%202019%20Edition/class-4/resource5c4858be565d8/Ebook.html
   ```

2. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to Network Tab:**
   - Click on the "Network" tab
   - Refresh the page (`F5` or `Cmd+R`)
   - Look for file types: PDF, SWF, or large image files

4. **Filter by type:**
   - Use the filter dropdown to select "Doc" or "Other"
   - Look for PDF files or unusual file types
   - Right-click and "Open in new tab" or "Copy link address"

## Method 2: Check Page Source

1. Right-click on the ebook page → "View Page Source" (`Ctrl+U` or `Cmd+Option+U`)
2. Search for keywords:
   - `.pdf`
   - `src=`
   - `resource`
   - `iframe`

## Method 3: Print to PDF (If it's a web-based reader)

1. Open the ebook in the browser
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
3. Select "Save as PDF" as the destination
4. This captures the viewable content

## Method 4: Check if Login Required

The ebook might require:
- Teacher/school account
- Purchased access
- Registration at https://www.vivadigital.in/viva-user-plateform

## For Your SmartBuds Project

Once you have the PDF:
1. Save it to `./tmp/icse_class4_math.pdf`
2. Use your existing `extract_pdf.py` to extract text
3. Use your `generate_real_class3_tests.py` to create questions

## Alternative: Contact Viva Education

If you're using this for educational/commercial purposes:
- Email: response@vivagroupindia.net
- Phone: 011 422 422 00
- Request API access or bulk content licensing

