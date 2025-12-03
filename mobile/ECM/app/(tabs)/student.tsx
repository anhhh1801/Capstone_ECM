import { TextStyles, ViewStyles } from '@/app/styles';
import { ScrollView, Text, View } from 'react-native';

export default function StudentTab() {
  return (
    <ScrollView contentContainerStyle={ViewStyles.container}>
      <View style={ViewStyles.card}>
        <Text style={TextStyles.body}>This is your student page.</Text>
      </View>
    </ScrollView>
  );
}
