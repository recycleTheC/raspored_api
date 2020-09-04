const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Exams = require("../models/Exams");

// @route    POST api/exam
// @desc     Create an exam
// @access   Private

router.post(
  "/",
  [
    auth,
    [
      body("date").not().isEmpty(),
      body("content").not().isEmpty(),
      body("classId").not().isEmpty(),
      body("classKey").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, content, classId, classKey } = req.body;

    try {
      const newExam = new Exams({
        date,
        content,
        classId,
        classKey,
      });

      const exam = await newExam.save();

      if (exam) {
        let exams = await Exams.find({
          date: date,
        });

        if (!exams) return res.json({ msg: "Ispiti nisu pronađeni" });

        res.json(exams); // Return all notes for simplicity
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/exam/:date
// @desc     Get daily exams
// @access   Public

router.get("/:date", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let exams = await Exams.find({
      date: req.params.date,
    }).populate({ path: "classKey", model: "classes", select: "name" });

    if (!exams) return res.json({ msg: "Ispiti nisu pronađeni" });

    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    DELETE api/exam/:id
// @desc     Delete exam
// @access   Private

router.delete("/:id", auth, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let examToDelete = await Exams.findOne({
      _id: req.params.id,
    });

    if (!examToDelete) return res.json({ msg: "Ispit nije pronađen" });

    const date = examToDelete.date;

    const deleted = await Exams.findOneAndDelete({
      _id: req.params.id,
    });

    let exams = await Exams.find({
      date: date,
    });

    if (!exams) return res.json({ msg: "Ispiti nisu pronađeni" });

    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    PUT api/exam/:id
// @desc     Update exam
// @access   Private

router.put("/:id", auth, async (req, res) => {
  const { content, date, classKey, classId } = req.body;

  // Build contact object
  const examFields = {};
  if (content) examFields.content = note;
  if (date) examFields.date = date;
  if (classKey) examFields.classKey = classKey;
  if (classId) examFields.classId = classId;

  try {
    let update = await Exams.findById(req.params.id);

    if (!update) {
      return res.status(404).json({ msg: "Ispit nije pronađen" });
    }

    update = await Exams.findByIdAndUpdate(req.params.id, examFields, {
      new: true,
    });

    let exams = await Exams.find({
      date: update.date,
    });

    if (!exams) return res.json({ msg: "Ispiti nisu pronađeni" });

    return res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
