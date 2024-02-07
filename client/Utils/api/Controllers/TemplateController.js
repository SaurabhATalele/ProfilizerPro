const Template = require('../Models/Templates.js');
const {organization} = require('../Models/Organizations')

const createTemplate = async (req, res) => {
    const {name, organization, createdBy, template} = req.body;
    const newTemplate = new Template({name, organization, createdBy, template});
    try{
        await newTemplate.save();
        res.status(201).json({newTemplate});
    }catch(error){
        res.status(409).json({message:error.message});
    }
}

const getTemplates = async (req, res) => {
    try{
        const templates = await Template.find();
        res.status(200).json({templates});
    }catch(error){
        res.status(404).json({message:error.message});
    }
}

const getTemplatesByOrg = async (req, res) => {
    const {id} = req.params;
    try{
        const templates = await Template.find({organization:id});
        res.status(200).json({templates});
    }catch(error){
        res.status(404).json({message:error.message});
    }
}

const deleteTemplate = async (req, res) => {
    const {id} = req.params;
    try{
        await Template.findByIdAndRemove(id);
        res.status(200).json({message:"Template deleted successfully."});
    }catch(error){
        console.log(error);
    }
}

const updateTemplate = async (req, res) => {
    const {id} = req.params;
    const {name, organization, createdBy, template} = req.body;
    try{
        const updatedTemplate = await Template.findByIdAndUpdate(id, {name, organization, createdBy, template}, {new:true});
        res.status(200).json({updatedTemplate});
    }catch(error){
        console.log(error);
    }
}


module.exports = {createTemplate, getTemplates, getTemplatesByOrg, deleteTemplate, updateTemplate};