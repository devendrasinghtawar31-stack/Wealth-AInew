export const goalDocs = {
    "/api/goals/create": {
        post: {
            tags: ["Goals Tracking Module"],
            summary: "🎯 Create Financial Goal",
            description: "Allows the user to set a new target (e.g., Car, Emergency Fund) with a deadline.",
            security: [{ BearerAuth: [] }],
            responses: {
                201: { description: "Goal created successfully." },
                401: { description: "Unauthorized." }
            }
        }
    },
    "/api/goals/update-progress/{id}": {
        put: {
            tags: ["Goals Tracking Module"],
            summary: "🔄 Update Goal Progress",
            description: "Updates the saved or current amount of a specific goal using its ID.",
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "The unique ID of the financial goal",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: { description: "Goal progress updated successfully." },
                404: { description: "Goal not found." }
            }
        }
    }
};