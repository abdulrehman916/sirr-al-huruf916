# Faal Chob Processing - Quick Start Guide

## 🚀 How to Process Your Screenshots

### Option 1: Use the Admin Interface (Recommended)

1. **Go to**: `/admin/faal-chob-upload`
2. **Upload**: Select all your Faal Chob card screenshots
3. **Process**: Click "Upload & Process"
4. **Review**: Check the results dashboard

### Option 2: Direct Function Call

If you prefer to call the function directly:

```javascript
import { base44 } from "@/api/base44Client";

const screenshotUrls = [
  "url1",  // Upload your images first using UploadFile
  "url2",
  // ...
];

const result = await base44.functions.invoke('extractFaalChobText', {
  screenshotUrls
});

console.log(result);
```

## 📋 What Happens Automatically

✅ **Reads combination codes** from screenshots (e.g., ددج، ا ب د)  
✅ **Extracts Persian text** (main, Danyal, Sadiq, verses)  
✅ **Generates Arabic translations**  
✅ **Generates Malayalam translations**  
✅ **Updates database** - only missing/incomplete cards  
✅ **Skips duplicates** - no overwriting  

## 🎯 Key Features

- **No manual mapping needed** - AI reads the combination automatically
- **Batch processing** - upload all 64 cards at once
- **Smart duplicate detection** - skips already-processed cards
- **Error handling** - continues even if some cards fail

## 📊 Example Results

```json
{
  "results": [
    {
      "success": true,
      "combination": "ددج",
      "gridPos": 44,
      "message": "Card updated successfully"
    },
    {
      "success": true,
      "combination": "ا ب ج",
      "gridPos": 7,
      "message": "Card already complete - no update needed"
    }
  ],
  "summary": {
    "total": 64,
    "updated": 50,
    "skipped": 14
  }
}
```

## 🔍 Troubleshooting

**Card not found?**
- Check that the combination uses valid letters (ا ب ج د only)
- Ensure all 3 letters are visible in the screenshot

**No text detected?**
- Use higher resolution screenshots
- Ensure good lighting and focus
- Make sure text is not cut off

**Translation issues?**
- Review the extracted Persian text
- Manually edit in database if needed
- Re-upload with clearer image

---

**Ready to process?** Navigate to `/admin/faal-chob-upload` and upload your screenshots!