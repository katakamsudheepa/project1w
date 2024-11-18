import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const animatedValue = new Animated.Value(0);

  // Load tasks from AsyncStorage when the app loads
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks)); // Populate tasks if data exists
      } catch (e) {
        console.error('Failed to load tasks from storage:', e);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever the tasks array is updated
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks)); // Store updated tasks
      } catch (e) {
        console.error('Failed to save tasks to storage:', e);
      }
    };
    saveTasks();
  }, [tasks]);

  // Add a new task and trigger an animation
  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]); // Add new task
      setTask(''); // Clear the input field
      animateAddTask(); // Start animation
    }
  };

  // Trigger animation for task addition
  const animateAddTask = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500, // Animation duration in milliseconds
      useNativeDriver: true,
    }).start(() => animatedValue.setValue(0)); // Reset animation
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1], // Map animation values
    outputRange: [0.9, 1], // Define scaling effect
  });

  // Toggle completion status of a task
  const toggleTask = (taskId) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Remove a task from the list
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
  };

  // Start editing a task
  const editTask = (taskId) => {
    const task = tasks.find((task) => task.id === taskId); // Find task to edit
    setEditingTaskId(taskId); // Set task ID for editing
    setEditingText(task.text); // Set current text for editing
  };

  // Save the edited task and mark it as completed
  const updateTask = () => {
    setTasks(tasks.map((task) =>
      task.id === editingTaskId
        ? { ...task, text: editingText, completed: true }
        : task
    ));
    setEditingTaskId(null); // Reset editing state
    setEditingText(''); // Clear editing text
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>To-Do List</Text>

      {/* Input Field and Add Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={{ transform: [{ scale }] }}>
            <View style={styles.taskContainer}>
              {/* Show text input if editing, otherwise display task */}
              {editingTaskId === item.id ? (
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                  onSubmitEditing={updateTask} // Update task on submit
                />
              ) : (
                <TouchableOpacity onPress={() => toggleTask(item.id)}>
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.taskCompletedText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}
              {/* Task Actions */}
              <View style={styles.taskActions}>
                <TouchableOpacity onPress={() => editTask(item.id)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id} // Set unique key for each task
      />
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  taskActions: {
    flexDirection: 'row',
  },
  editButton: {
    color: '#5C5CFF',
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
  },
});
