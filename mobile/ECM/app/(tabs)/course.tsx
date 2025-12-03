import { TextStyles, ViewStyles } from '@/app/styles';
import { ScrollView, Text, View } from 'react-native';

export default function CourseTab() {
  return (
    <ScrollView contentContainerStyle={ViewStyles.container}>
      <View style={ViewStyles.card}>
        <Text style={TextStyles.body}>This is your course page.</Text>
      </View>
    </ScrollView>
  );
}
