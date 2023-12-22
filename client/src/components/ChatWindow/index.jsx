import React, { useEffect, useState } from "react";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { updatePeople } from "../../store/slices/chatRoomSlice";
import randomColor from "randomcolor";
import PropleList from "./propleList";
import { socket } from "../../services/socket";
import NewRoomRequest from "./NewRoomRequest";
import { fetchProblems, updateAllProblems } from "../../store/slices/roomSlice";
const ChatWindow = () => {
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const room = useSelector((state) => state.chatRoom.roomName);
  const [messagesRecieved, setMessagesReceived] = useState([]);
  const [message, setMessage] = useState("");
  // const [username, setUsername] = useState("shiva");
  const username = useSelector((state) => state.user.username);
  // const [room, setRoom] = useState("room1");
  const [joined, setJoined] = useState(false);
  const dispatch = useDispatch();

  const joinroom = () => {
    if (username !== "") {
      // console.log("sending join room request", username);
      socket.emit("join_room", { username: username, room: "room" });
      socket.on("chatroom_users", (data) => {
        // console.log("chatroom_users", data);
        dispatch(updatePeople(data));
      });
    }
  };

  useEffect(() => {
    console.log("chant window use effect");
    if (socket !== undefined) {
      socket.on("receive_message", (data) => {
        setMessagesReceived((state) => [
          ...state,
          {
            message: data.message,
            username: data.username,
            __createdtime__: data.__createdtime__,
          },
        ]);
      });

      socket.on("chatroom_users", (data) => {
        console.log("chatroom_users", data);
        dispatch(updatePeople(data));
      });

      socket.on("new_questions_request", (data) => {
        setMessagesReceived((state) => [
          ...state,
          {
            newRoomRequest: true,
            message: data.message,
            username: data.username,
            __createdtime__: data.__createdtime__,
          },
        ]);
      });

      socket.on("update_room_questions", (data) => {
        dispatch(updateAllProblems(data));
      });
      console.log("socket changed");
      return () => socket.off("receive_message");
    }
    // Remove event listener on component unmount
  }, [socket]);

  useEffect(() => {
    joinroom();
  }, []);

  const sendMessage = (message) => {
    if (message !== "") {
      const __createdtime__ = Date.now();
      // Send message to server. We can't specify who we send the message to from the frontend. We can only send to server. Server can then send message to rest of users in room
      socket.emit("send_message", {
        username,
        message,
        __createdtime__,
        room: "room",
      });
      setMessage("");
    }
  };

  const people = useSelector((state) => state.chatRoom.people);

  const sendNewQuestionsRequest = async () => {
    socket.emit("new_questions", { room: "room", username });
  };

  const sendNewQuestionsResponse = ({ status }) => {
    socket.emit("new_questions_response", { room: "room", username, status });
    console.log("seding from socket", { room: "room", username, status });
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="h-[42px]">
        <p className="">Current user details</p>
      </div>
      <div className="people-div flex flex-col gap-2 mb-4">
        <p className="text-sm text-gray-400">{people.length} people</p>
        <PropleList />
        <button
          className="px-4 py-2 hover:bg-[#464646] rounded-[8px] bg-tertiary active:bg-tertiary"
          onClick={() => {
            sendNewQuestionsRequest();
          }}
        >
          New Questions
        </button>
      </div>
      <div className="p-[6px] flex flex-col bg-secondary w-full flex-1 justify-between gap-2 overflow-y-scroll scrollbar-none">
        <div className="flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-[#525252] scrollbar-track-transparent pr-2 scrollbar-thumb-rounded-full">
          {messagesRecieved.map((message, ind) =>
            message.newRoomRequest ? (
              <NewRoomRequest
                sendNewQuestionsResponse={sendNewQuestionsResponse}
              />
            ) : (
              <Message
                key={"message" + ind}
                message={message}
                username={username}
              />
            )
          )}
          <div />
        </div>
        <div>
          <div className="flex gap-4 mb-1">
            {/* <input value={room} onChange={(e) => setRoom(e.target.value)} /> */}

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="flex-1 p-2 bg-primary border-[1px] rounded-md border-[#525252]"
              onKeyDown={(e) => {
                if (e.code === "Enter") sendMessage(message);
              }}
            />
            <button
              className="bg-[#3d3d3d] hover:bg-[#464646] rounded-lg p-2"
              onClick={() => sendMessage(message)}
            >
              Send Message
            </button>
            <button onClick={sendNewQuestionsRequest}>test</button>
          </div>
          {/* 
          <div className="flex w-full justify-end">
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatWindow);
