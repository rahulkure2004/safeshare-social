import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import { expect, test, vi } from 'vitest';
import type { Post, Profile } from '@/types';

// Mock the Supabase client and custom hooks
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
    })),
  },
}));

vi.mock('@/hooks/useComments', () => ({
  useAddComment: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useLikes', () => ({
  useToggleLike: () => ({ mutate: vi.fn() }),
  useDeletePost: () => ({ mutate: vi.fn() }),
}));

const mockProfile: Profile = {
  id: '123',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date().toISOString(),
  bio: '',
  role: 'user'
};

test('test_postcard_render_success', () => {
  const mockPost: Post = {
    id: 'post-1',
    profile_id: mockProfile.id,
    caption: 'Hello world!',
    image_url: 'https://example.com/post.jpg',
    video_url: null,
    created_at: new Date().toISOString(),
    profiles: mockProfile,
    comments: [],
    likes: [{ count: 12 }]
  };

  render(<PostCard post={mockPost} currentUser={mockProfile} />);

  // Should render the username
  expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
  // Should render the caption
  expect(screen.getByText('Hello world!')).toBeInTheDocument();
  // Should render like count
  expect(screen.getByText('12 likes')).toBeInTheDocument();
});


