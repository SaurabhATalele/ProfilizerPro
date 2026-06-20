import Organization from "../Models/Organizations";
import { NextRequest, NextResponse } from "next/server";

interface RequestWithUser extends NextRequest {
  user?: { userId: string };
  params?: { id: string };
  body?: unknown;
}

export const createOrganization = async (req: RequestWithUser, res: unknown): Promise<void> => {
  try {
    const body = await req.json();
    const { name } = body;
    const user = req.user;
    const organization = new Organization({ name, owner: user?.userId });
    await organization.save();
    // Legacy response pattern
  } catch (error: unknown) {
    console.log(error);
  }
};

export const getOrganizations = async (_req: unknown, res: unknown): Promise<unknown> => {
  try {
    const data = await Organization.find();
    return data;
  } catch (error: unknown) {
    console.log(error);
    return null;
  }
};

export const deleteOrganization = async (req: RequestWithUser, res: unknown): Promise<void> => {
  try {
    const body = await req.json();
    const _id = body.id;
    const userId = req.user?.userId;
    await Organization.findOneAndDelete({ _id, owner: userId });
  } catch (error) {
    console.log(error);
  }
};

export const renameOrganization = async (req: RequestWithUser, res: unknown): Promise<void> => {
  try {
    const body = await req.json();
    const _id = body.id;
    const newName = body.name;
    await Organization.findByIdAndUpdate(_id, { name: newName });
  } catch (error) {
    console.log(error);
  }
};
