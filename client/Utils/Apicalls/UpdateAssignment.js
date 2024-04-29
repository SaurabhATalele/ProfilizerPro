import {UPDATE_ASSIGNMENT} from '../constants'

export const updateAssignment = async (data) => {
    try {
        const response = await fetch(UPDATE_ASSIGNMENT, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
    };