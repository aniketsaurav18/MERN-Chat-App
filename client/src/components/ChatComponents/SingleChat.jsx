import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/chatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModel";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import "./style.css";
import Lottie from "lottie-react";
import animationData from "../../assets/typing.json";

const ENDPOINT = `http://143.110.244.1`;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  // const [typing, setTyping] = useState(false);
  // const [istyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    // socket.on("typing", () => setIsTyping(true));
    // socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const getSender = (loggedUser, chatUser) => {
    return chatUser[0]._id === loggedUser._id
      ? chatUser[1].name
      : chatUser[0].name;
  };

  // --------------- Fetch Messages -------------
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const res = await fetch(`/api/message/${selectedChat._id}`, config);
      const data = await res.json();
      // console.log(data);
      if (!res.ok) {
        throw new Error(data);
      }
      setMessages(data);
      setLoading(false);
      socket.emit("join room", selectedChat._id);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: "Failed to fetch messages",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  //------------------------------------------

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            content: newMessage,
            chatId: selectedChat._id,
          }),
        };
        setNewMessage("");
        const res = await fetch(`/api/message/`, config);
        const data = await res.json();
        console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (err) {
        toast({
          title: "Error Occured",
          description: "Failed to send message",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessage.chatId._id
      ) {
        // give notification
        if (!notification.includes(newMessage.chatId._id)) {
          setNotification([newMessage, ...notification]);
          console.log(notification);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessage]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    //typing indicator logic
    // if (!socketConnected) return;
    // if (!typing) {
    //   setTyping(true);
    //   socket.emit("typing", selectedChat._id);
    // }
    // let lastTypingTime = new Date().getTime();
    // var timerLength = 2000;
    // setTimeout(() => {
    //   var timeNow = new Date().getTime();
    //   var timeDiff = timeNow - lastTypingTime;
    //   if (timeDiff >= timerLength && typing) {
    //     socket.emit("stop typing", selectedChat._id);
    //     setTyping(false);
    //   }
    // }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {getSender(user, selectedChat.users)}
            <ProfileModal
              user={
                user._id === selectedChat.users[1]._id
                  ? selectedChat.users[0]
                  : selectedChat.users[1]
              }
            />
          </Text>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {/* {istyping ? (
                <Lottie
                  animationData={animationData}
                  style={{ marginBottom: 15, marginLeft: 0, width: "9%" }}
                  rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
                />
              ) : null} */}
              <Input
                variant={"filled"}
                bg="#E0E0E0"
                value={newMessage}
                placeholder="Enter a message..."
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
        >
          <Text fontSize="2xl" textAlign="center" fontFamily={"Work sans"}>
            Click on a chat to start messaging
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
