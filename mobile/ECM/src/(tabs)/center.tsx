import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import centerService, { Center, User, CenterRequest } from '../services/center';

export default function CenterTab() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [listType, setListType] = useState<'teachers' | 'students'>('teachers');
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating/updating center
  const [formData, setFormData] = useState<CenterRequest>({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  });

  // Fetch all centers
  const fetchCenters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await centerService.getAllCenters();
      setCenters(data);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch centers: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch teachers by center
  const fetchTeachers = useCallback(async (centerId: number) => {
    try {
      const data = await centerService.getTeachersByCenter(centerId);
      setTeachers(data);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch teachers: ${error}`);
    }
  }, []);

  // Fetch students by center
  const fetchStudents = useCallback(async (centerId: number) => {
    try {
      const data = await centerService.getStudentsByCenter(centerId);
      setStudents(data);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch students: ${error}`);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCenters();
    setRefreshing(false);
  }, [fetchCenters]);

  // Open center details
  const handleOpenDetails = async (center: Center) => {
    setSelectedCenter(center);
    setListType('teachers');
    await fetchTeachers(center.id);
    setDetailsModalVisible(true);
  };

  // Switch between teachers and students list
  const handleSwitchList = async (type: 'teachers' | 'students') => {
    if (!selectedCenter) return;
    setListType(type);
    if (type === 'teachers') {
      await fetchTeachers(selectedCenter.id);
    } else {
      await fetchStudents(selectedCenter.id);
    }
  };

  // Create center
  const handleCreateCenter = async () => {
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setIsCreating(true);
      await centerService.createCenter(formData);
      Alert.alert('Success', 'Center created successfully');
      setFormData({ name: '', address: '', phone: '', email: '', description: '' });
      setModalVisible(false);
      await fetchCenters();
    } catch (error) {
      Alert.alert('Error', `Failed to create center: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete center
  const handleDeleteCenter = (center: Center) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${center.name}"?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await centerService.deleteCenter(center.id);
              Alert.alert('Success', 'Center deleted successfully');
              await fetchCenters();
            } catch (error) {
              Alert.alert('Error', `Failed to delete center: ${error}`);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Remove student from center
  const handleRemoveStudent = (student: User) => {
    if (!selectedCenter) return;
    Alert.alert(
      'Confirm Remove',
      `Remove ${student.name} from this center?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await centerService.removeStudentFromCenter(selectedCenter.id, student.id);
              Alert.alert('Success', 'Student removed successfully');
              await fetchStudents(selectedCenter.id);
            } catch (error) {
              Alert.alert('Error', `Failed to remove student: ${error}`);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Render center card
  const renderCenterCard = ({ item }: { item: Center }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenDetails(item)}
      onLongPress={() => handleDeleteCenter(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>Address:</Text>
        <Text style={styles.cardText}>{item.address}</Text>
        <Text style={styles.cardLabel}>Phone:</Text>
        <Text style={styles.cardText}>{item.phone}</Text>
        <Text style={styles.cardLabel}>Email:</Text>
        <Text style={styles.cardText}>{item.email}</Text>
        {item.description && (
          <>
            <Text style={styles.cardLabel}>Description:</Text>
            <Text style={styles.cardText}>{item.description}</Text>
          </>
        )}
      </View>
      <Text style={styles.tapHint}>Tap to view details • Long press to delete</Text>
    </TouchableOpacity>
  );

  // Render user item (teacher or student)
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDetail}>{item.email}</Text>
        {item.phone && <Text style={styles.userDetail}>{item.phone}</Text>}
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      {listType === 'students' && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveStudent(item)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Centers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Center</Text>
        </TouchableOpacity>
      </View>

      {/* Centers List */}
      <FlatList
        data={centers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCenterCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No centers available</Text>
          </View>
        }
      />

      {/* Create/Edit Center Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Center</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Center Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter center name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />

              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
              />

              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description (optional)"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.buttonDisabled]}
                onPress={handleCreateCenter}
                disabled={isCreating}
              >
                <Text style={styles.buttonText}>
                  {isCreating ? 'Creating...' : 'Create Center'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Center Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCenter?.name}</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Center Info */}
            <ScrollView style={styles.detailsContainer}>
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Center Information</Text>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailText}>{selectedCenter?.address}</Text>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailText}>{selectedCenter?.phone}</Text>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailText}>{selectedCenter?.email}</Text>
                {selectedCenter?.description && (
                  <>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailText}>{selectedCenter?.description}</Text>
                  </>
                )}
              </View>

              {/* Teachers/Students Section */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    listType === 'teachers' && styles.tabActive,
                  ]}
                  onPress={() => handleSwitchList('teachers')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      listType === 'teachers' && styles.tabTextActive,
                    ]}
                  >
                    Teachers ({teachers.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    listType === 'students' && styles.tabActive,
                  ]}
                  onPress={() => handleSwitchList('students')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      listType === 'students' && styles.tabTextActive,
                    ]}
                  >
                    Students ({students.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Users List */}
              {listType === 'teachers' ? (
                <FlatList
                  data={teachers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderUserItem}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyListText}>No teachers assigned</Text>
                    </View>
                  }
                />
              ) : (
                <FlatList
                  data={students}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderUserItem}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyList}>
                      <Text style={styles.emptyListText}>No students assigned</Text>
                    </View>
                  }
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailsSection: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0066cc',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  userDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '500',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyListText: {
    fontSize: 14,
    color: '#999',
  },
});
