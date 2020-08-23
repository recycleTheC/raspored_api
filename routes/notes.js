const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Notes = require("../models/Notes");

// @route    POST api/notes
// @desc     Create a schedule
// @access   Private

router.post(
  "/",
  [
    auth,
    [
      body("date").not().isEmpty(),
      body("note").not().isEmpty(),
      body("classId").not().isEmpty(),
      body("classKey").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, note, classId, classKey } = req.body;

    try {
      const newNote = new Notes({
        date,
        note,
        classId,
        classKey,
      });

      const _note = await newNote.save();

      res.json(_note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/notes/:date
// @desc     Get daily notes
// @access   Public

router.get("/:date", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let notes = await Notes.find({
      date: req.params.date,
    });

    //if (!schedule) return res.status(404).json({ msg: "Schedule not found" });
    if (!notes) return res.json({ msg: "Biljeske nisu pronadjene" });

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
