import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  getAssignments,
  deleteAssignment,
  createAssignment,
  updateAssignment,
} from '../api/api';
import {Assignment, RootStackParamList} from '../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showToast} from '../utils/toast';
import {useFocusEffect} from '@react-navigation/native';
import { getData, storeData } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Assignments'>;

const AssignmentsScreen: React.FC<Props> = ({route}) => {
  const {courseId} = route.params;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'completed'
  >('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isOfflineData, setIsOfflineData] = useState(false);


  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
  });

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setIsOfflineData(false);
  
      const res = await getAssignments(courseId);
  
      if (Array.isArray(res.data)) {
        setAssignments(res.data);
        await storeData(`assignments-${courseId}`, res.data);
      } else if (res.data && res.data?.message === "No assignments found for this course") {
        setAssignments([]);
        await storeData(`assignments-${courseId}`, []);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      showToast('Failed to fetch from API, loading from cache');
      const cached = await getData<Assignment[]>(`assignments-${courseId}`);
      if (Array.isArray(cached)) {
        setAssignments(cached);
        setIsOfflineData(true); 
      } else {
        setAssignments([]);
      }
    } finally {
      setLoading(false);
    }
  };
  

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
      return () => {
        setAssignments([]);
      };
    }, []),
  );


  const handleDelete = async (id: number) => {
    try {
      await deleteAssignment(id);
      loadAssignments();
      showToast('Deleted Successfully');
    } catch (err) {
      showToast('Delete failed');
    }
  };

  const handleMarkCompleted = async (assignment: Assignment) => {
    try {
      await updateAssignment(assignment.id, {
        ...assignment,
        status: 'completed',
      });
      loadAssignments();
    } catch (err) {
      showToast('Failed to mark completed');
    }
  };

  const handleSubmit = async () => {
    const {title, due_date} = formData;

    if (!title.trim() || !due_date.trim()) {
      showToast('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      let res;
      if (editingAssignment) {
        res = await updateAssignment(editingAssignment.id, {
          ...editingAssignment,
          title: formData.title,
          due_date: formData.due_date,
        });
      } else {
        res = await createAssignment({
          course_id: courseId,
          title: formData.title,
          due_date: formData.due_date,
          status: 'pending',
        });
      }

      setFormData({title: '', due_date: ''});
      setEditingAssignment(null);
      setShowForm(false);
      setFilterStatus('all');
      loadAssignments();
      showToast(res?.data?.message);
    } catch (err) {
      showToast('Failed to submit assignment');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({title: assignment.title, due_date: assignment.due_date});
    setShowForm(true);
  };

  const renderSkeletonAssignment = () => (
    <View style={styles.card}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonButtons} />
    </View>
  );

  const renderAssignmentItem = (item: Assignment) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Due: {item.due_date}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.actions}>
        {item.status === 'pending' && (
          <Button title="✔ Done" onPress={() => handleMarkCompleted(item)} />
        )}
        <Button title="Edit" onPress={() => handleEdit(item)} />
        <Button title="Delete" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  const filteredAssignments = assignments
  .filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  })
  .sort((a, b) => {
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });


  return (
    <View style={styles.container}>
      {!loading && (
        <Button
          title={showForm ? 'Cancel' : 'Add New Assignment'}
          onPress={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setFormData({title: '', due_date: ''});
              setEditingAssignment(null);
            }
          }}
        />
      )}

      {!loading && showForm && (
        <View style={styles.form}>
          <TextInput
            placeholder="Assignment Title"
            value={formData.title}
            onChangeText={text => setFormData(prev => ({...prev, title: text}))}
            style={styles.input}
          />
          <TextInput
            placeholder="Due Date (YYYY-MM-DD)"
            value={formData.due_date}
            onChangeText={text =>
              setFormData(prev => ({...prev, due_date: text}))
            }
            style={styles.input}
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
      {!loading && (
        <>
          <View style={styles.filterRow}>
            {['all', 'pending', 'completed'].map(status => (
              <Button
                key={status}
                title={status.charAt(0).toUpperCase() + status.slice(1)}
                onPress={() => setFilterStatus(status as typeof filterStatus)}
                color={filterStatus === status ? '#007bff' : '#999'}
              />
            ))}
          </View>
          <View style={{alignItems: 'center', marginBottom: 10}}>
            <Button
              title={`Sort: Due ${sortOrder === 'asc' ? '↑' : '↓'}`}
              onPress={() =>
                setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
              }
            />
          </View>
        </>
      )}
      {!loading && isOfflineData && (
        <Text style={styles.offlineBanner}>⚠ Offline: Showing cached data</Text>
      )}

      <FlatList
        data={loading ? [1, 2, 3, 4] : filteredAssignments}
        keyExtractor={(item, index) =>
          loading
            ? `skeleton-${index}`
            : item?.id?.toString() ?? index.toString()
        }
        renderItem={({item}) =>
          loading ? renderSkeletonAssignment() : renderAssignmentItem(item)
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={{textAlign: 'center', marginTop: 16}}>
              No assignments found.
            </Text>
          ) : null
        }
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  card: {
    backgroundColor: '#e8e8e8',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
    width: '60%',
  },
  skeletonLine: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonButtons: {
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 10,
    width: '50%',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
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

export default AssignmentsScreen;
