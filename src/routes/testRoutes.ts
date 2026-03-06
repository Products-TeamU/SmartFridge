import express from 'express';
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'GET test works' });
});

router.post('/test', (req, res) => {
  res.json({ received: req.body });
});

export default router;