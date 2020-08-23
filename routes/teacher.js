const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const Teacher = require("../models/Teacher");

// @route    GET api/teacher/:id
// @desc     Get teacher
// @access   Public

router.get("/:id", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

    res.json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/teacher/
// @desc     Get all teachers
// @access   Public

router.get("/", async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let teacher = await Teacher.find();

    if (!teacher) return res.status(404).json({ msg: "Teachers not found" });

    res.json(teacher);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    POST api/teacher
// @desc     Create a teacher
// @access   Private

router.post(
  "/",
  [auth, [body("name", "Name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    try {
      const newTeacher = new Teacher({
        name,
      });

      const teacher = await newTeacher.save();

      res.json(teacher);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
