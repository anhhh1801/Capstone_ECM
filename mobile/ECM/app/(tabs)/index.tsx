import { TextStyles, ViewStyles } from '@/app/styles';
import { ScrollView, Text, View } from 'react-native';

export default function HomeTab() {
  return (
    <ScrollView contentContainerStyle={ViewStyles.container}>
      <View style={ViewStyles.card}>
        <Text style={TextStyles.title}>Welcome Home</Text>
        <Text style={TextStyles.body}>This is your home page.</Text>
      </View>
    </ScrollView>
  );
}
