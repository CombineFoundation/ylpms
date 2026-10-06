import { NextRequest } from "next/server";
import { withAuth } from "@/middleware/auth.middleware";
import { getTaskById, updateTask, deleteTask } from "@/services/task.service";
import { getUserById } from "@/services/user.service";
import { requireCanManageUser } from "@/utils/authorization";
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from "@/utils/errors";
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

/** Monthly tasks belong to the youth leader's RO; Head RO can see them but not change them. */
function requireNotViewOnlyMonthly(
  caller: { userId: string; role: string },
  task: { assignedTo: string; assignedBy: string; monthlyCycle?: string }
) {
  if (task.monthlyCycle && caller.role === "head-ro" && caller.userId !== task.assignedBy && caller.userId !== task.assignedTo) {
    throw new AuthorizationError("Monthly tasks are managed by the youth leader's RO");
  }
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
      requireNotViewOnlyMonthly(authReq.user, task);

      const validatedData = updateTaskSchema.parse(await req.json());

      // The assignee only tracks progress: finishing goes through submit + review.
      const isAssigneeOnly =
        authReq.user.userId === task.assignedTo &&
        authReq.user.userId !== task.assignedBy &&
        authReq.user.role !== "head-ro" &&
        authReq.user.role !== "developer";
      if (isAssigneeOnly) {
        // Title, due date, priority etc. belong to whoever assigned it.
        const otherFields = Object.keys(validatedData).filter((key) => key !== "status");
        if (otherFields.length > 0) throw new AuthorizationError("Only whoever assigned this task can change its details");
      }
      if (isAssigneeOnly && validatedData.status && validatedData.status !== task.status) {
        if (task.status === "submitted" || task.status === "completed" || task.status === "cancelled") {
          throw new AuthorizationError("This task is with your reviewer; you can't change its status");
        }
        if (validatedData.status !== "assigned" && validatedData.status !== "in-progress") {
          throw new AuthorizationError("Submit your work to finish this task; whoever assigned it reviews it");
        }
      }

      // Submitted work is accepted or sent back through the review step, so it's recorded and the assignee is told.
      if (task.status === "submitted" && validatedData.status && validatedData.status !== "cancelled") {
        throw new ValidationError("This task is waiting for review. Open it and accept it or request changes.");
      }

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
      requireNotViewOnlyMonthly(authReq.user, task);

      await deleteTask(taskId, authReq.user.userId);

      return apiSuccess({ message: "Task deleted successfully" });
    } catch (error) {
      return apiError(error);
    }
  })(req);
}
