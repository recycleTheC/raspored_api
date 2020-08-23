const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Classes = require("../models/Classes");

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

module.exports = router;
