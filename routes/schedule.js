const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Schedule = require("../models/Schedule");

// @route    POST api/schedule
// @desc     Create a schedule
// @access   Private

router.post(
  "/",
  [
    auth,
    [
      body("day").isIn([
        "ponedjeljak",
        "utorak",
        "srijeda",
        "četvrtak",
        "subota",
        "nedjelja",
      ]),
      body("week").isIn(["parni", "neparni"]),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { day, week, classes } = req.body;

    console.log(req.body);

    try {
      const newSchedule = new Schedule({
        week,
        day,
        classes,
      });

      const schedule = await newSchedule.save();

      res.json(schedule);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/schedule/:week/:day
// @desc     Get daily schedule
// @access   Public

router.get("/:week/:day", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let schedule = await Schedule.findOne({
      week: req.params.week,
      day: req.params.day,
    }).populate({
      path: "classes.class",
      model: "classes",
      select: "name",
      populate: { path: "teacher", model: "teacher", select: "name" },
    });

    if (!schedule) return res.json({ msg: "Raspored nije pronađen" });

    res.json(schedule.classes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
