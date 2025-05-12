export interface Course {
    id: number;
    course_name: string;
    professor?: string;
    start_date: string;
    end_date: string;
  }
  
  export interface Assignment {
    id: number;
    course_id: number;
    title: string;
    due_date: string;
    status: 'pending' | 'completed';
  }
  
  export type RootStackParamList = {
    Courses: undefined;
    Assignments: { courseId: number };
  };
  