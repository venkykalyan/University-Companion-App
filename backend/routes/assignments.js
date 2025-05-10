const express = require('express');
const router = express.Router();

const pool = require('../db');


router.post('/assignments', async (req, res) => {
    const { course_id, title, due_date, status } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO assignments (course_id, title, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [course_id, title, due_date, status || 'pending']
      );
      res.status(201).json({ message: 'Assignment created successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  router.get('/courses/:courseId/assignments', async (req, res) => {
    const { courseId } = req.params; 
    
    try {
      const result = await pool.query('SELECT * FROM assignments WHERE course_id = $1', [courseId]);
      if (result.rows.length === 0) {
        return res.status(200).json({ message: 'No assignments found for this course' });
      }
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error retrieving assignments:', err);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

router.put('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    const { course_id, title, due_date, status } = req.body;
    try {
      const result = await pool.query(
        'UPDATE assignments SET course_id=$1, title=$2, due_date=$3, status=$4 WHERE id=$5 RETURNING *',
        [course_id, title, due_date, status, id]
      );
      res.status(201).json({ message: 'Assignment updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
      res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;