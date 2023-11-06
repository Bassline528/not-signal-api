
// Create a function to remove properties
// Define the properties you want to remove
const propertiesToRemove = [
  "password",
  "refreshToken",
  "ownerOfRooms",
  "bannedRooms",
  "roomsParticipant",
  "isActive",
];
const removeProperties = (obj) => {
  for (const prop of propertiesToRemove) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }
};


module.exports = {
    removeProperties,
    };

