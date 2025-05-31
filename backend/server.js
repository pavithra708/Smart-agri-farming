import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/fertilizerRecommender', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FertilizerSchema = new mongoose.Schema({
  cropType: String,
  soilType: String,
  npkRanges: {
    low: { N: Number, P: Number, K: Number },
    high: { N: Number, P: Number, K: Number }
  },
  fertilizer: String
});

const Fertilizer = mongoose.model('Fertilizer', FertilizerSchema, 'fertilizers');

// Load fertilizer data
const fertilizerData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fertilizer_data.json')));

const loadDataIntoDB = async () => {
  await Fertilizer.deleteMany({});
  await Fertilizer.insertMany(fertilizerData);
};

loadDataIntoDB();

app.post('/api/recommend-fertilizer', async (req, res) => {
  const { cropType, soilType, nitrogen, phosphorus, potassium } = req.body;

  try {
    const recommendations = await Fertilizer.find({
      cropType: new RegExp(`^${cropType}$`, 'i'),
      soilType: new RegExp(`^${soilType}$`, 'i'),
      'npkRanges.low.N': { $lte: nitrogen },
      'npkRanges.high.N': { $gte: nitrogen },
      'npkRanges.low.P': { $lte: phosphorus },
      'npkRanges.high.P': { $gte: phosphorus },
      'npkRanges.low.K': { $lte: potassium },
      'npkRanges.high.K': { $gte: potassium },
    });

    if (recommendations.length === 0) {
      return res.json({ fertilizer: 'General Fertilizer Recommendation (Adjust NPK levels)' });
    }

    res.json({ fertilizer: recommendations[0].fertilizer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});