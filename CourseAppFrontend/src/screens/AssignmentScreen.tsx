import React, { useEffect, useState } from 'react';
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
import { Assignment, RootStackParamList } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { showToast } from '../utils/toast';

type Props = NativeStackScreenProps<RootStackParamList, 'Assignments'>;

const AssignmentsScreen: React.FC<Props> = ({ route }) => {
  const { courseId } = route.params;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
  });

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await getAssignments(courseId);
      setAssignments(res.data);
    } catch (err) {
        showToast('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAssignments();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteAssignment(id);
      loadAssignments();
      showToast('Deleted Successfully');
    } catch (err) {
        showToast('Delete failed',);
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
      loadAssignments();
      showToast(res?.data?.message);
    } catch (err) {
      showToast('Failed to submit assignment');
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({ title: assignment.title, due_date: assignment.due_date });
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

  return (
    <View style={styles.container}>
      {!loading && (
        <Button
          title={showForm ? 'Cancel' : 'Add New Assignment'}
          onPress={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setFormData({ title: '', due_date: '' });
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
            onChangeText={text =>
              setFormData(prev => ({ ...prev, title: text }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Due Date (YYYY-MM-DD)"
            value={formData.due_date}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, due_date: text }))
            }
            style={styles.input}
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          renderItem={renderSkeletonAssignment}
          removeClippedSubviews={false}
        />
      ) : assignments.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 16 }}>No assignments found.</Text>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => renderAssignmentItem(item)}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
});

export default AssignmentsScreen;
