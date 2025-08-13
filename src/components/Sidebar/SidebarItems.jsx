import CreatePost from "./CreatePost";
import Notifications from "./Notifications";
import ProfileLink from "./ProfileLink";
import Search from "./Search";
import Inicio from "./Home"

const SidebarItems = () => {
	return (
		<>
			<Inicio />
			<Search />
			<Notifications />
			<CreatePost />
			<ProfileLink />
		</>
	);
};

export default SidebarItems;
