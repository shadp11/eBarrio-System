export const connectedUsers = new Map();

export const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userID, role) => {
      connectedUsers.set(userID, {
        socketId: socket.id,
        role,
      });
      socket.userID = userID;
      socket.role = role;
      socket.join(userID);
      console.log(`Socket joined room: ${userID}`);
      console.log("All connectedUsers:", connectedUsers);
    });

    socket.on("unregister", (userID) => {
      socket.leave(userID);
      connectedUsers.delete(userID);
    });

    socket.on("disconnect", () => {
      connectedUsers.forEach((info, userID) => {
        if (info.socketId === socket.id) {
          connectedUsers.delete(userID);
          console.log(`User ${userID} removed from connectedUsers`);
        }
      });
    });
  });
};
