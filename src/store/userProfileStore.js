import { create } from "zustand";

const useUserProfileStore = create((set) => ({
	userProfile: null,
	setUserProfile: (userProfile) => set({ userProfile }),
	// this is used to update the number of posts in the profile page
	addPost: (post) =>
		set((state) => ({
			userProfile: { 
				...state.userProfile, 
				posts: [post.id, ...(state.userProfile?.posts || [])] 
			},
		})),
	deletePost: (postId) =>
		set((state) => {
			console.log("Eliminando post del store:", postId);
			console.log("Posts antes:", state.userProfile?.posts);
			const newPosts = (state.userProfile?.posts || []).filter((id) => id !== postId);
			console.log("Posts después:", newPosts);
			return {
				userProfile: {
					...state.userProfile,
					posts: newPosts,
				},
			};
		}),
}));

export default useUserProfileStore;