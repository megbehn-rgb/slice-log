import { useRouter } from 'expo-router';
import { ProfilePicker } from '../src/components/ProfilePicker';
import { useProfile } from '../src/context/ProfileContext';

export default function SwitchProfileScreen() {
  const router = useRouter();
  const { setActiveProfile } = useProfile();

  return (
    <ProfilePicker
      title="Switch to..."
      onSelect={(profile) => {
        setActiveProfile(profile);
        router.back();
      }}
    />
  );
}
