const express = require("express");
const router = express.Router();

const pool = require("../db");

router.post("/", async (req, res) => {
  const { course_name, professor, start_date, end_date } = req.body;
  try {
    await pool.query(
      "INSERT INTO courses (course_name, professor, start_date, end_date) VALUES ($1, $2, $3, $4)",
      [course_name, professor, start_date, end_date]
    );
    res.status(201).json({ message: "Course created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { course_name, professor, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      "UPDATE courses SET course_name=$1, professor=$2, start_date=$3, end_date=$4 WHERE id=$5 RETURNING *",
      [course_name, professor, start_date, end_date, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(201).json({ message: "Course updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
