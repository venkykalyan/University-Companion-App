import axios from 'axios';
import { Course, Assignment } from '../types';

const API = axios.create({
  baseURL: 'https://university-companion-app.onrender.com/api',
  timeout: 30*1000
});

// Courses
export const getCourses = () => API.get<Course[]>('/courses');

export const createCourse = (course: {
  course_name: string;
  professor: string;
  start_date: string;
  end_date: string;
}) => API.post('/courses', course);

export const updateCourse = (
  id: number,
  course: { course_name: string; professor?: string; start_date: string; end_date: string }
) => API.put(`/courses/${id}`, course);

export const deleteCourse = (id: number) => API.delete(`/courses/${id}`);


// Assignments
export const getAssignments = (courseId: number) =>
    API.get<Assignment[]>(`/courses/${courseId}/assignments`);
  
export const createAssignment = (assignment: {
    course_id: number;
    title: string;
    due_date: string;
    status?: 'pending' | 'completed';
  }) => API.post('/assignments', assignment);
  
  export const updateAssignment = (id: number, updatedData: Assignment) =>
    API.put(`/assignments/${id}`, updatedData);
  
 
  export const deleteAssignment = (id: number) =>
    API.delete(`/assignments/${id}`);
  
  export const markAssignmentCompleted = (assignment: Assignment) => {
    return API.put(`/assignments/${assignment.id}`, assignment);
  };
