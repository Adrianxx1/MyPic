import CreatePost from "./CreatePost";
import Notifications from "./Notifications";
import ProfileLink from "./ProfileLink";
import Search from "./Search";
import Inicio from "./Home";
import Messages from "./Messages";

const SidebarItems = () => {
	return (
		<>
			<Inicio />
			<Search />
			<Messages />
			<Notifications />
			<CreatePost />
			<ProfileLink />
		</>
	);
};

export default SidebarItems;