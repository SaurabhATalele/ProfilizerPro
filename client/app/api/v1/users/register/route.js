import { registerUser } from "@/Utils/api/Controllers/UserController";
import connectdb from "@/Utils/api/db/connectDB";

export async function POST(req, res) {
  try {
    connectdb();
    const body = await req.json();
    const response = registerUser(body);
    return response;
  } catch (error) {
    console.log(error);
  }
}
