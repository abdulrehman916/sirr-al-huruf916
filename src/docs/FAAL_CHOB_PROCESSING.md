# Faal Chob Automated Processing System

## 📋 Overview

This system automatically processes Faal Chob card screenshots to extract text and generate translations in Arabic and Malayalam. The system uses AI-powered OCR and translation to populate the 64-card divination database.

## 🎯 What It Does

1. **Extracts Arabic combination codes** (e.g., ددج، ا ب د) from screenshots
2. **Extracts Persian text** (main text, Danyal, Sadiq, verses)
3. **Generates Arabic translations** automatically
4. **Generates Malayalam translations** automatically
5. **Updates the FaalChobTranslation entity** in the database
6. **Skips already-processed cards** to avoid duplicates

## 📁 File Structure

```
functions/
  └─ extractFaalChobText          # Backend processing function

pages/
  └─ AdminFaalChobUpload          # Admin upload interface

entities/
  └─ FaalChobTranslation.json     # Database schema

lib/
  └─ faalChobData.js              # Card reference data
  └─ faalChobTranslations.js      # Arabic & Malayalam translations
```

## 🚀 How to Use

### Step 1: Access the Upload Page

Navigate to: **`/admin/faal-chob-upload`**

> ⚠️ **Admin Access Required** - Only admin users can access this page.

### Step 2: Upload Screenshots

1. Click **"Select screenshots"** or drag and drop files
2. Select Faal Chob card images (PNG, JPG, WebP)
3. You can upload multiple cards at once
4. Click **"Upload & Process"**

### Step 3: Review Results

The system displays processing results:

- ✅ **Successful** - Cards extracted and updated
- ⏭️ **Skipped** - Already complete or no text detected
- ❌ **Failed** - Processing error

### Step 4: Verify Updates

The extracted translations are automatically saved to the `FaalChobTranslation` entity. You can verify the updates by checking the database or viewing the Faal Chob page.

## 🔧 Technical Details

### Backend Function: `extractFaalChobText`

**Input:**
```json
{
  "screenshotUrls": ["url1", "url2", ...]
}
```

**Process:**
1. Uses LLM (Gemini Flash) for OCR text extraction
2. Detects 3-letter Arabic combination codes
3. Matches combinations to existing cards
4. Generates translations only if missing
5. Updates database records

**Output:**
```json
{
  "results": [
    {
      "success": true,
      "combination": "ددج",
      "gridPos": 44,
      "message": "Card updated successfully"
    }
  ],
  "summary": {
    "total": 10,
    "updated": 8,
    "skipped": 2
  }
}
```

### Entity Schema: `FaalChobTranslation`

```json
{
  "gridPos": 44,
  "source_text": "Persian main text",
  "arabic": {
    "text": "Arabic translation",
    "danyal": "Arabic Danyal",
    "sadiq": "Arabic Sadiq"
  },
  "malayalam": {
    "text": "Malayalam translation",
    "danyal": "Malayalam Danyal",
    "sadiq": "Malayalam Sadiq"
  }
}
```

## ✨ Features

### Smart Duplicate Detection
- Skips cards that already have complete translations
- Prevents overwriting existing content
- Saves processing time and credits

### Automatic Language Generation
- **Arabic**: Formal spiritual Arabic matching traditional tone
- **Malayalam**: Natural translation preserving spiritual meaning
- Both maintain structure (text, danyal, sadiq sections)

### Combination Matching
- Handles variations: "ددج", "د د ج", "د‌دج"
- Normalizes spaces and formatting
- Matches to grid positions 1-64

### Error Handling
- Continues processing if one card fails
- Reports detailed error messages
- Logs skipped cards with reasons

## 🎨 Admin Interface Features

- **File Upload**: Drag-and-drop or click to select
- **Progress Tracking**: Real-time upload and processing status
- **Results Dashboard**: Visual summary with success/failure counts
- **Detailed Logs**: Individual card status with error messages
- **Responsive Design**: Works on desktop and mobile

## 📊 Usage Example

**Scenario**: You have 64 Faal Chob card screenshots to process.

1. **Upload all 64 images** at once
2. **System processes** each card:
   - Extracts combination code
   - Matches to database
   - Generates translations
3. **Results**:
   - 60 cards updated successfully
   - 4 cards skipped (already complete)
4. **Verify** translations on Faal Chob page

## 🔐 Security

- **Admin-only access** - Regular users cannot process uploads
- **Authentication required** - Must be logged in
- **Secure file handling** - Files uploaded to private storage

## 💡 Tips

### Best Practices
1. **Use clear screenshots** - High resolution, good lighting
2. **Show full card** - Include combination code and all text
3. **Batch process** - Upload multiple cards at once for efficiency
4. **Review results** - Check for any failed extractions

### Troubleshooting

**"No combination detected"**
- Ensure the 3 Arabic letters are clearly visible
- Try a higher resolution screenshot
- Check that letters are not cut off

**"No card found for combination"**
- Verify the combination matches the standard 64 cards
- Check for invalid letters (ت, چ) or wrong length
- Reference `lib/faalChobData.js` for valid combinations

**Translation quality issues**
- Review the extracted Persian text accuracy
- Manually edit translations in the database if needed
- Re-upload with clearer screenshot

## 📈 Monitoring

Track processing statistics:
- Total cards processed
- Successful updates
- Skipped cards
- Failed extractions

All results are logged and displayed in the admin interface.

## 🔗 Related Files

- **Upload Page**: `pages/AdminFaalChobUpload`
- **Backend Function**: `functions/extractFaalChobText`
- **Card Data**: `lib/faalChobData.js`
- **Translations**: `lib/faalChobTranslations.js`
- **Entity Schema**: `entities/FaalChobTranslation.json`

## 📞 Support

For issues or questions:
1. Check the processing logs in the admin interface
2. Review error messages for specific cards
3. Verify screenshot quality and visibility
4. Ensure admin access permissions

---

**Built with Base44 Platform** | **AI-Powered Processing** | **Multi-Language Support**