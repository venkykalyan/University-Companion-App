import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCourses, createCourse } from '../api/api';
import { Course, RootStackParamList } from '../types';
import { showToast } from '../utils/toast';
import { useFocusEffect } from '@react-navigation/native';
import { getData, storeData } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Courses'>;

const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    professor: '',
    start_date: '',
    end_date: '',
  });
  const [isOfflineData, setIsOfflineData] = useState(false);


  const loadCourses = async () => {
    try {
      setIsOfflineData(false); 
      setLoading(true);
      const res = await getCourses();
  
      if (Array.isArray(res.data)) {
        setCourses(res.data);
        await storeData('courses', res.data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      showToast('Failed to fetch courses, loading from cache');
      const cached = await getData<Course[]>('courses');
      if (Array.isArray(cached)) {
        setCourses(cached);
        setIsOfflineData(true);
      } else {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleAddCourse = async () => {
    const {course_name, start_date, end_date} = newCourse;

    if (!course_name.trim() || !start_date.trim() || !end_date.trim()) {
      showToast('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const res = await createCourse(newCourse);
      console.log('res',res);
      setNewCourse({
        course_name: '',
        professor: '',
        start_date: '',
        end_date: '',
      });
      setShowForm(false);
      await loadCourses();
      showToast(res?.data?.message);
    } catch (err) {
      showToast('Failed to create course');
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, []),
  );

  const renderSkeleton = () => (
    <View style={styles.card}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonTitle} />
      </View>
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  );


  const renderCourseItem = (item: Course) => (
    <View style={styles.card}>
      <View style={styles.courseRow}>
        <Text style={styles.title}>{item.course_name}</Text>
        <Button
          title="View Assignments"
          onPress={() => navigation.navigate('Assignments', { courseId: item.id })}
        />
      </View>
      <Text>Professor: {item.professor || 'N/A'}</Text>
      <Text>Start: {item.start_date}</Text>
      <Text>End: {item.end_date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!loading && (
        <Button
          title={showForm ? 'Cancel' : 'Add New Course'}
          onPress={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setNewCourse({
                course_name: '',
                professor: '',
                start_date: '',
                end_date: '',
              });
            }
          }}
        />
      )}
      {!loading && showForm && (
        <View style={styles.form}>
          <TextInput
            placeholder="Course Name"
            value={newCourse.course_name}
            onChangeText={text =>
              setNewCourse(prev => ({...prev, course_name: text}))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Professor (optional)"
            value={newCourse.professor}
            onChangeText={text =>
              setNewCourse(prev => ({...prev, professor: text}))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Start Date (YYYY-MM-DD)"
            value={newCourse.start_date}
            onChangeText={text =>
              setNewCourse(prev => ({...prev, start_date: text}))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="End Date (YYYY-MM-DD)"
            value={newCourse.end_date}
            onChangeText={text =>
              setNewCourse(prev => ({...prev, end_date: text}))
            }
            style={styles.input}
          />
          <Button title="Submit" onPress={handleAddCourse} />
        </View>
      )}
      {!loading && isOfflineData && (
        <Text style={styles.offlineBanner}>⚠ Offline: Showing cached data</Text>
      )}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={item => `skeleton-${item}`}
          renderItem={() => renderSkeleton()}
        />
      ) : courses.length === 0 ? (
        <Text style={{marginTop: 20, textAlign: 'center'}}>
          No courses found.
        </Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={item => `course-${item.id}`}
          renderItem={({item}) => renderCourseItem(item)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skeletonTitle: {
    width: 150,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonText: {
    width: '80%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  offlineBanner: {
    backgroundColor: '#ffe4b5',
    color: '#333',
    textAlign: 'center',
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
    fontWeight: '600',
  },
});

export default CourseListScreen;
