const { sendMail, sendMailUsingMailsender } = require("../common/common");
const user = require("../modal/user");
var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
var jwt = require("jsonwebtoken");
exports.createUser = async (req, res) => {
    const { name, email, password, userType } = req.body;

    // 🔴 Validation checks
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    if (!userType) {
        return res.status(400).json({ message: "User type is required" });
    }
    // ✅ Optional: email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ Optional: password strength
    if (password.length < 10) {
        return res.status(400).json({ message: "Password must be at least 10 characters" });
    }

    try {
        const isUserExists = await user.findOne({ email });

        if (isUserExists) {
            return res.status(409).json({
                message: "User already exists!"
            });
        }

        // 🔐 Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const data = {
            ...req.body,
            password: hash
        };

        console.log(data);

        const createResponse = await user.create(data);
        if (createResponse) {
            // 📧 Send mail
            await sendMailUsingMailsender({
                recipient: email,
                name: name,
                subject: "User Registered",
                text: "User successfully registered to ZORYVN"
            });

            return res.status(201).json({
                isSuccess: true,
                message: "User registered successfully, please check your mail"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
    res.send({ msg: "Response received" })
}

exports.signin = async (req, res) =>{
    const data = JSON.parse(JSON.stringify(req.body))
    const { email, password } = data;
    // console.log(email,password);
    
    if(data){
        const isUserExists = await user.findOne({email: email});
        if(isUserExists){
            bcrypt.compare(password,isUserExists.password, async(err, result)=>{
                if(result){
                    await jwt.sign({
                        data: {
                            email: isUserExists.email,
                            name: isUserExists.name,
                            userType: isUserExists.userType
                        }
                    },"mysecret",{
                        expiresIn: 60*60
                    },(err, token)=>{
                        if(err){
                            console.log('91-->',err);                            
                        } else {
                            res.cookie("Admin",token,{
                                expiresIn: new Date(Date.now() + 30000),
                                httpOnly: true,
                            });
                            res.status(200).json({isSuccess: true, message: "Logged In Successfully", token: token})
                        }
                    })
                } else {
                    res.status(400).json({isSuccess: false, message: "Password not match"})
                }
            })
        } else {
            res.status(400).json({isSuccess: false, message: "User not found"})
        }
    }
}

exports.getUser = async (req,res) =>{
    let users = await user.find({},{__v:0,password:0});
    res.status(200).json({users,legth: users.length})
}

exports.deleteUser = async (req, res) => {
    let { id } = JSON.parse(JSON.stringify(req.body));

    try {
        const createResponse = await user.deleteOne({ _id: id });
        if (createResponse) {
            res.status(200).json({ isSuccess: true, message: "User Deleted Successfully !" })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}

exports.updateUser = async (req, res) => {
    let { id, status } = JSON.parse(JSON.stringify(req.body));
    if (!id || !status) {
        return res.status(400).json({
            message: "id, status are required"
        });
    }
    console.log(id,status);
    
    try {
        const createResponse = await user.findByIdAndUpdate({ _id: id },{$set: {status}});
        if (createResponse) {
            res.status(200).json({ isSuccess: true, message: "User Updated Successfully !" })
        } else {
            res.status(400).json({ message: "Something Went Wrong !" })
        }
    } catch (e) {
        res.status(400).json({ message: e })
    }
}