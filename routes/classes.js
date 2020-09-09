const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Classes = require("../models/Classes");
const Schedule = require("../models/Schedule");
const { addBusinessDays, format, getWeek } = require("date-fns");
const locale = require("date-fns/locale/hr");

// @route    POST api/class
// @desc     Create a class
// @access   Private

router.post(
  "/",
  [auth, [body("name").not().isEmpty(), body("teacher").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, teacher } = req.body;

    try {
      const newClass = new Classes({
        name,
        teacher,
      });

      const _class = await newClass.save();

      res.json(_class);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/class
// @desc     Get classes
// @access   Public

router.get("/", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let classes = await Classes.find().populate({
      path: "teacher",
      model: "teacher",
    });

    if (!classes) return res.json({ msg: "Predmeti nisu pronadjeni" });

    res.json(classes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/class/:date/:id
// @desc     Get classes from date
// @access   Public

router.get("/:date/:id", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let findClass = await Classes.findById(req.params.id);

    if (!findClass) return res.json({ msg: "Predmeti nisu pronadjeni" });

    const id = req.params.id;
    const fromDate = new Date(req.params.date);
    const maxDays = 14; // define max number of days that schedule will be checked
    var currentDate = fromDate;
    var availableDates = [];

    for (var i = 0; i < maxDays; i++) {
      var week = getWeek(currentDate) % 2 === 0 ? "parni" : "neparni";
      var day = format(currentDate, "eeee", { locale, weekStartsOn: 2 });

      let schedule = await Schedule.findOne({
        week: week,
        day: day,
        validFrom: {
          $lte: currentDate,
        },
        validUntil: {
          $gte: currentDate,
        },
      });

      if (schedule) {
        let result = false;
        let classId = null;

        // Something is wrong here, but it works at this state

        /**
         * @todo Reimplement function for getting dates when the class is attended
         */

        const search = (item, time) => {
          if (item == id) {
            result = true;
            classId = time;
          }
          return;
        };

        schedule.classes.forEach((item) => {
          var time = item.id;
          item.class.forEach((x) => search(x, time));
        });

        if (result) {
          availableDates.push({ date: currentDate, id: classId });
        }
      }
      currentDate = addBusinessDays(currentDate, 1);
    }

    res.json(availableDates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
