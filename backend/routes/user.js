const User = require('../models/user'); // Adjust the path as needed
const express = require('express');
const router = express.Router();
const {authenticate} =require("../middleware/middleware")


router.get('/profile/:username', async (req,res)=> {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username })
          .select('-password') // Exclude the password field
          .populate('favorite', 'title image') // Populate favorite novels
          .populate('NovelsCreated', 'title image') // Populate created novels
          .populate('Lastview.novel', 'title image'); // Populate last viewed novels
          

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    
})

router.post('/favorite/:novelId',authenticate, async (req, res) => {
    try {
      const { novelId } = req.params;
      const user = req.user; // Assuming you have user authentication middleware

        if (!user.favorite.includes(novelId)) {
            user.favorite.push(novelId);
        await User.findByIdAndUpdate(user._id, { favorite: user.favorite });
      }

      res.json({ message: 'Novel added to favorites',user:user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.delete('/favorite/:novelId',authenticate, async (req, res) => {
    try {

      const { novelId } = req.params;
      const user = req.user; // Assuming you have user authentication middleware
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
    user.favorite = user.favorite.filter(id => id.toString() !== novelId);
    await User.findByIdAndUpdate(user._id, { favorite: user.favorite });

 
  
      res.json({ message: 'Novel removed from favorites',user:user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  


//get last viewed chapter
router.get("/lastViewedChapter/:novelId",authenticate, async (req,res)=>{
    const {novelId} = req.params
    const user = req.user
    try {
      const lastView = user.Lastview.find(view => view.novel.toString() === novelId);
      console.log(lastView)
      res.json({ lastViewedChapter: lastView ? lastView.chapterNumber : null });
    } catch (error) {
      res.status(500).json({ message: "Error fetching last viewed chapter" });
    }
})

//update last viewed chapter
router.post("/lastViewedChapter/:novelId",authenticate, async (req,res)=>{
    const {novelId} = req.params
    const {chapterNumber} = req.body
    const user = req.user

    if (!Number.isInteger(chapterNumber) || chapterNumber <= 0) {
      return res.status(400).json({ message: "Invalid chapter number" });
    }

    try {

      const lastViewIndex = user.Lastview.findIndex(view => view.novel.toString() === novelId);
      
      let update;
      if (lastViewIndex !== -1) {
          update = {
            $set: { [`Lastview.${lastViewIndex}.chapterNumber`]: chapterNumber }
          };
      } else {
        // Add new entry and remove oldest if limit reached
        update = {
          $push: {
            Lastview: {
              $each: [{ novel: novelId, chapterNumber: chapterNumber }],
              $slice: -10 // Keep only the last 10 entries
            }
          }
        };
      }
  
      await User.findByIdAndUpdate(user._id, update);
      res.json({ message: "Last viewed chapter updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating last viewed chapter" });
    }
})

module.exports = router;