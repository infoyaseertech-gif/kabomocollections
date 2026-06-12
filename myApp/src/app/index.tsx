import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>KABOMO COLLECTIONS</Text>

      <Text style={styles.subtitle}>
        Fashion • Collections • Sales
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Enter Store</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});