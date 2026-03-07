import { ProfileForm } from '@/components/features/profile/ProfileForm';

export const metadata = {
    title: 'Profile | IIT Ropar Community',
    description: 'Manage your IIT Ropar Community profile, bio, and posting identity',
};

export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto py-6 md:py-8 animate-fade-in space-y-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold font-serif tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal details and view your Positions of Responsibility.
                </p>
            </div>

            <ProfileForm />
        </div>
    );
}
