import { PageContainer } from '@/components/layout/PageContainer';
import { BlogForm } from '@/components/features/blogs/BlogForm';

export const metadata = {
    title: 'Publish Experience | IIT Ropar Community',
    description: 'Share your internship or placement experience with the community.',
};

export default function CreateBlogPage() {
    return (
        <PageContainer
            title="Share Experience"
            description="Write an article or share your interview experience."
            backHref="/blogs"
        >
            <div className="mt-8">
                <BlogForm />
            </div>
        </PageContainer>
    );
}
