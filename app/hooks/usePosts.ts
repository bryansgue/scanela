import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  getPostsByProfile,
  deletePost,
  updatePost,
  uploadPostMedia,
} from "../lib/supabase/posts";
import { Post } from "../types/Post";

export function usePosts(profileId: string | null) {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ["posts", profileId],
    queryFn: () => (profileId ? getPostsByProfile(profileId) : Promise.resolve([])),
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: addPost, isPending: addingPost } = useMutation({
    mutationFn: ({
      userId,
      profileId,
      title,
      description,
      uploadMethod,
      mediaUrl,
      networks,
      scheduledFor,
    }: {
      userId: string;
      profileId: string;
      title: string;
      description: string;
      uploadMethod: "media" | "url" | "text";
      mediaUrl?: string;
      networks: string[];
      scheduledFor?: string;
    }) =>
      createPost({
        userId,
        profileId,
        title,
        description,
        uploadMethod,
        mediaUrl,
        networks,
        scheduledFor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", profileId] });
    },
  });

  const { mutate: removePost, isPending: removingPost } = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", profileId] });
    },
  });

  const { mutate: editPost, isPending: editingPost } = useMutation({
    mutationFn: ({
      postId,
      updates,
    }: {
      postId: string;
      updates: Partial<Omit<Post, "id" | "user_id" | "created_at">>;
    }) => updatePost(postId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", profileId] });
    },
  });

  const { mutate: uploadMedia, isPending: uploadingMedia } = useMutation({
    mutationFn: ({
      file,
      userId,
      profileId,
    }: {
      file: File;
      userId: string;
      profileId: string;
    }) => uploadPostMedia(file, userId, profileId),
  });

  return {
    posts,
    loading,
    addPost,
    removePost,
    editPost,
    uploadMedia,
    addingPost,
    removingPost,
    editingPost,
    uploadingMedia,
  };
}
