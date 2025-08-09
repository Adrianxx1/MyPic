import { Box, Flex, Tooltip, Avatar, Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { CreatePostLogo, NotificationsLogo, SearchLogo } from "@/assets/constants";
import { AiFillHome } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";

const Sidebar = () => {
    const sidebarItems = [
        {
            icon: <AiFillHome size={25} />,
            text: "Home",
            link: "/",
        },
        {
            icon: <SearchLogo />,
            text: "Search",
        },
        {
            icon: <NotificationsLogo />,
            text: "Notifications",
        },
        {
            icon: <CreatePostLogo />,
            text: "Create",
        },
        {
            icon: <Avatar size={"sm"} name='Burak Orkmez' src='/profilepic.png' />,
            text: "Profile",
            link: "/username",
        },
    ];

    return (
        <Box
            height={"100vh"}
            borderRight={"1px solid"}
            borderColor={"whiteAlpha.300"}
            py={8}
            position={"sticky"}
            top={0}
            left={0}
            px={{ base: 2, md: 4 }}
        >
            <Flex direction={"column"} gap={4} w="full" height={"full"}>
                {/* Logo Desktop */}
                <ChakraLink
                    as={RouterLink}
                    to="/"
                    p={1}
                    display={{ base: "none", md: "block" }}
                    cursor="pointer"
                >
                    <img
                        src="/logo1.png"
                        alt="Logo Desktop"
                        style={{
                            height: "156px",
                            maxWidth: "100%",
                            objectFit: "contain",
                        }}
                    />
                </ChakraLink>

                {/* Logo Mobile */}
                <ChakraLink
                    as={RouterLink}
                    to="/"
                    p={2}
                    display={{ base: "block", md: "none" }}
                    borderRadius={6}
                    _hover={{ bg: "whiteAlpha.200" }}
                    w={10}
                    cursor="pointer"
                >
                    <img
                        src="/LogoMobile.png"
                        alt="Logo Mobile"
                        style={{
                            height: "34px",
                            objectFit: "contain",
                        }}
                    />
                </ChakraLink>

                {/* Sidebar Items */}
                <Flex direction={"column"} gap={5} cursor={"pointer"}>
                    {sidebarItems.map((item, index) => (
                        <Tooltip
                            key={index}
                            hasArrow
                            label={item.text}
                            placement="right"
                            ml={1}
                            openDelay={500}
                            display={{ base: "block", md: "none" }}
                        >
                            <ChakraLink
                                as={RouterLink}
                                to={item.link || "#"}
                                display={"flex"}
                                alignItems={"center"}
                                gap={4}
                                _hover={{ bg: "whiteAlpha.400" }}
                                borderRadius={6}
                                p={2}
                                w={{ base: 10, md: "full" }}
                                justifyContent={{ base: "center", md: "flex-start" }}
                            >
                                {item.icon}
                                <Box display={{ base: "none", md: "block" }}>
                                    {item.text}
                                </Box>
                            </ChakraLink>
                        </Tooltip>
                    ))}
                </Flex>

                {/* Logout */}
                <Tooltip
                    hasArrow
                    label={"Logout"}
                    placement="right"
                    ml={1}
                    openDelay={500}
                    display={{ base: "block", md: "none" }}
                >
                    <ChakraLink
                        as={RouterLink}
                        to="/auth"
                        display={"flex"}
                        alignItems={"center"}
                        gap={4}
                        _hover={{ bg: "whiteAlpha.400" }}
                        borderRadius={6}
                        p={2}
                        w={{ base: 10, md: "full" }}
                        mt={"auto"}
                        justifyContent={{ base: "center", md: "flex-start" }}
                    >
                        <BiLogOut size={25} />
                        <Box display={{ base: "none", md: "block" }}>Logout</Box>
                    </ChakraLink>
                </Tooltip>
            </Flex>
        </Box>
    );
};

export default Sidebar;
