
const Organization = require("../Models/Organizations.js");


const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const user = req.user;
        const organization = await new Organization({ name,owner: user.userId });
        await organization.save();
        res.status(200).json({ message: "Organization Created Successfully" });
    } catch (error) {
        console.log(error);
        const message = error._message;
        res.status(500).json({ message: message });
    }
}

const getOrganizations = async (req, res) => {
    try {
        const data = await Organization.find();
        res.status(200).json({ data });
    } catch (error) {
        console.log(error);
        const message = error._message;
        res.status(500).json({ message: message });
    }
}

const deleteOrganization = async (req,res)=>{
    try {
        const _id = req.params.id;
        const userId = req.user.userId;
        const data = await Organization.findOneAndDelete({_id,owner:userId});
        res.status(200).json({message:"Organization Deleted Successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something Went Wrong"});
    }
}

const renameOrganization = async (req,res) =>{
    const _id = req.params.id;
    const newName = req.body.name;
    try{
        const data = Organization.findByIdAndUpdate(_id,{name:newName});
        console.log(data);
        res.status(200).json({message:"Organization Renamed Successfully"});

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Something Went Wrong"}); 
}

}

module.exports = { createOrganization, getOrganizations,renameOrganization,deleteOrganization }
