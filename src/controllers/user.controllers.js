import {User} from "../models/user.models.js"

const registerUser = async(req,res) => {
    //res.send("User registered successfully");
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db

    // check for user creation
    // return res

    const {username,email,mobilenumber,age,address} = req.body;

    if(username == ""){
        res.status(401).json("username is missing");
    }
    if([username,mobilenumber,age,address,email].some((fields) => fields?.trim() === "")){
        res.status(400).json("all fields are required");
    }
    const existedUser = await User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        res.status(409).json("user with email or username is already exists")
    }

    const user = User.create({
        email,
        username : username.toLowerCase(),
        mobilenumber,
        age,
        address : address.toLowerCase(),
    })

    return res.status(201).json("user registered successfully");
}


const deleteUser =  async (req, res) => {
  try {
    // 1. Get id from URL
    const userId = req.params.id;

    // 2. Find and delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    // 3. If user not found
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 4. Success response
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export {registerUser,deleteUser};