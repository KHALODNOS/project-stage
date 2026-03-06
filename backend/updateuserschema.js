const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path as necessary

const updateUsers = async () => {
    try {
        const updatedUsers = await User.find({favorite});
        console.log(updatedUsers);
      console.log(`Successfully updated ${result.nModified} users.`);
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      mongoose.connection.close();
    }
  };
  
  updateUsers();


