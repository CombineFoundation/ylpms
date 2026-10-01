import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getTaskById, updateTask, deleteTask } from "@/services/task.service";
import { getUserById } from "@/services/user.service";
import { requireCanManageUser } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/utils/errors";
import { updateTaskSchema } from "@/utils/validation";
import { apiError, apiSuccess } from "@/utils/api-response";

type Params = { params: Promise<{ taskId: string }> };

function canModifyTask(
  caller: { userId: string; role: string },
  task: { assignedTo: string; assignedBy: string }
): boolean {
  if (caller.role === "head-ro" || caller.role === "developer") return true;
  return caller.userId === task.assignedTo || caller.userId === task.assignedBy;
}

/**
 * GET /api/tasks/[taskId] - Get a single task
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      if (!canModifyTask(authReq.user, task)) throw new AuthorizationError();

      return apiSuccess(task);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * PATCH /api/tasks/[taskId] - Update a task (status, priority, reassignment, etc.)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      if (!canModifyTask(authReq.user, task)) throw new AuthorizationError();

      const validatedData = updateTaskSchema.parse(await req.json());

      // Reassigning is a manager action: the assignee can't hand their task
      // off, and the new assignee must be someone the caller manages.
      if (validatedData.assignedTo && validatedData.assignedTo !== task.assignedTo) {
        if (authReq.user.userId === task.assignedTo && authReq.user.userId !== task.assignedBy) {
          throw new AuthorizationError("You can't reassign a task assigned to you");
        }
        const newAssignee = await getUserById(validatedData.assignedTo);
        if (!newAssignee) throw new NotFoundError("Assignee not found");
        await requireCanManageUser(authReq.user, newAssignee);
      }

      const updated = await updateTask(
        taskId,
        {
          ...validatedData,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        },
        authReq.user.userId
      );

      return apiSuccess(updated);
    } catch (error) {
      return apiError(error);
    }
  })(req);
}

/**
 * DELETE /api/tasks/[taskId] - Delete a task
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  return withAuth(async (authReq) => {
    try {
      if (!authReq.user) throw new AuthenticationError();

      const task = await getTaskById(taskId);
      if (!task) throw new NotFoundError("Task not found");

      if (authReq.user.role !== "head-ro" && authReq.user.role !== "developer" && authReq.user.userId !== task.assignedBy) {
        throw new AuthorizationError();
      }

      await deleteTask(taskId, authReq.user.userId);

      return apiSuccess({ message: "Task deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
