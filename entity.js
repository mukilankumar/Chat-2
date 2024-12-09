let users = [];

const addUser = ({ id, employeeId, user }) => {
    const existingUser = users.find(u => u.employeeId === employeeId);
    
    if (existingUser) {
        return { error: 'User already exists' };
    }

    const newUser = { id, employeeId, user }; // Store socket ID, employee ID, and username
    users.push(newUser); // Add the new user to the array
    console.log(users);
    
    return { response: newUser };
};

const getUser = (id) => {
    return users.find(e => e.id == id);
}

// Function to get user by employee ID (or socket ID if needed)
const getUserByEmployeeId = (employeeId) => {
    return users.find(user => user.employeeId === employeeId); // Lookup by employee ID
};

// Function to get user by socket ID
const getUserBySocketId = (socketId) => {
    return users.find(user => user.id === socketId); // Lookup by socket ID
};

const getRoomUsers = (room) => {
    return users.map(u => u.employeeId);
}

const removeUser = (id) => {
    const findIdx = users.findIndex(e => e.id == id);

    if (findIdx >= 0) {
        return users.splice(findIdx, 1)[0]
    }
}
module.exports = {
    addUser,
    getUser,
    removeUser,
    getRoomUsers,
    getUserByEmployeeId,
    getUserBySocketId
}