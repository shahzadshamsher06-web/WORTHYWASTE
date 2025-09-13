const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'waste-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Mock rule-based classifier function
function classifyWaste(filename, noteText = '') {
  const lowerFilename = filename.toLowerCase();
  const lowerNote = noteText.toLowerCase();
  const combinedText = lowerFilename + ' ' + lowerNote;

  // Define classification rules based on keywords
  const compostableKeywords = [
    'fruit', 'vegetable', 'apple', 'banana', 'orange', 'carrot', 'potato', 'onion',
    'lettuce', 'tomato', 'bread', 'rice', 'pasta', 'egg', 'shell', 'coffee',
    'tea', 'leaves', 'peel', 'core', 'organic', 'food', 'leftovers'
  ];

  const recyclableKeywords = [
    'bottle', 'can', 'plastic', 'glass', 'paper', 'cardboard', 'metal',
    'aluminum', 'steel', 'newspaper', 'magazine', 'box', 'container',
    'packaging', 'wrapper', 'bag', 'recyclable'
  ];

  const nonUsableKeywords = [
    'battery', 'electronic', 'chemical', 'paint', 'oil', 'medicine',
    'toxic', 'hazardous', 'broken', 'damaged', 'contaminated', 'dirty',
    'moldy', 'rotten', 'spoiled'
  ];

  // Check for keywords in combined text
  let compostableScore = 0;
  let recyclableScore = 0;
  let nonUsableScore = 0;

  compostableKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) compostableScore++;
  });

  recyclableKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) recyclableScore++;
  });

  nonUsableKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) nonUsableScore++;
  });

  // Determine category based on highest score
  let category, action;

  if (nonUsableScore > 0) {
    category = 'non-usable';
    action = 'Dispose of safely at designated hazardous waste facility. Do not put in regular trash.';
  } else if (compostableScore > recyclableScore) {
    category = 'compostable';
    action = 'Add to compost bin or sell to local composting facilities. Great for creating nutrient-rich soil!';
  } else if (recyclableScore > 0) {
    category = 'recyclable';
    action = 'Clean and sort into appropriate recycling bins. Can be sold to recycling centers for extra income.';
  } else {
    // Default classification based on common patterns
    if (combinedText.includes('food') || combinedText.includes('kitchen')) {
      category = 'compostable';
      action = 'Appears to be organic waste. Add to compost bin or sell to composting facilities.';
    } else {
      category = 'recyclable';
      action = 'Check local recycling guidelines and clean before disposal. Consider selling to recycling centers.';
    }
  }

  return { category, action };
}

// POST /api/classify/image - Accept multipart/form-data (image), return JSON { category, action }
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { note } = req.body; // Optional note text from user
    const filename = req.file.originalname;
    
    // Run mock classification
    const classification = classifyWaste(filename, note);

    // Prepare response data
    const responseData = {
      success: true,
      classification: {
        category: classification.category,
        action: classification.action
      },
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date().toISOString()
      }
    };

    // Add note to response if provided
    if (note) {
      responseData.note = note;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Image classification error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during image classification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/classify/categories - Get available waste categories
router.get('/categories', (req, res) => {
  try {
    const categories = [
      {
        name: 'compostable',
        description: 'Organic waste that can be composted',
        examples: ['fruit peels', 'vegetable scraps', 'coffee grounds', 'eggshells'],
        color: '#4CAF50'
      },
      {
        name: 'recyclable',
        description: 'Materials that can be recycled',
        examples: ['plastic bottles', 'glass containers', 'paper', 'metal cans'],
        color: '#2196F3'
      },
      {
        name: 'non-usable',
        description: 'Hazardous or non-recyclable waste',
        examples: ['batteries', 'chemicals', 'broken electronics', 'contaminated items'],
        color: '#F44336'
      }
    ];

    res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/classify/image/:filename - Delete uploaded image
router.delete('/image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
