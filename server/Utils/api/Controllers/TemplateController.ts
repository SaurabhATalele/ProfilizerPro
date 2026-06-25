import Template from "../Models/Templates";

interface TemplateBody {
  name: string;
  organization: string;
  createdBy: string;
  template: unknown;
}

export const createTemplate = async (body: TemplateBody): Promise<unknown> => {
  const { name, organization, createdBy, template } = body;
  const newTemplate = new Template({ name, organization, createdBy, template });
  try {
    await newTemplate.save();
    return newTemplate;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const getTemplates = async (): Promise<unknown> => {
  try {
    const templates = await Template.find();
    return templates;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const getTemplatesByOrg = async (id: string): Promise<unknown> => {
  try {
    const templates = await Template.find({ organization: id });
    return templates;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const deleteTemplate = async (id: string): Promise<unknown> => {
  try {
    await Template.findByIdAndDelete(id);
    return { message: "Template deleted successfully." };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateTemplate = async (id: string, body: TemplateBody): Promise<unknown> => {
  const { name, organization, createdBy, template } = body;
  try {
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { name, organization, createdBy, template },
      { new: true },
    );
    return updatedTemplate;
  } catch (error) {
    console.log(error);
    return null;
  }
};
