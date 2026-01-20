import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  return router.replace('/(tabs)/dashboard');
}