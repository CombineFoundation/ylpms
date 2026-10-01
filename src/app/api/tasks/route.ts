import { withAuth } from "@/middleware/auth.middleware";
import { getTasks, createTask, enrichTasksForList } from "@/services/task.service";
import { getUserById } from "@/services/user.service";
import { requireRole } from "@/utils/auth";
import { requireCanManageUser } from "@/utils/authorization";
import { resolveActingAs } from "@/utils/sro-scope";
import { AuthenticationError, NotFoundError, ValidationError } from "@/utils/errors";
import { createTaskSchema } from "@/utils/validation";
import { apiError, apiSuccess, parsePagination } from "@/utils/api-response";
import { TaskStatus } from "@/types/task.types";

const STATUS_FILTERS = ["assigned", "in-progress", "completed", "overdue", "cancelled", "open"] as const;

/**
 * GET /api/tasks - One page of tasks (with assignee names), ordered by due date
 * GET /api/tasks?status=open|overdue|assigned|...&pageSize=25&pageNumber=1
 */
export const GET = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TaskStatus | "open" | null;
    if (status && !STATUS_FILTERS.includes(status)) throw new ValidationError("Invalid status filter");

    const isOrgWide = req.user.role === "head-ro" || req.user.role === "developer";

    const page = await getTasks({
      status: status || undefined,
      // Non-org-wide roles only see tasks assigned to them.
      assignedTo: isOrgWide ? undefined : req.user.userId,
      ...parsePagination(searchParams),
    });

    const tasks = await enrichTasksForList(page.items);

    return apiSuccess(tasks, 200, { page: page.page, pageSize: page.pageSize, hasMore: page.hasMore });
  } catch (error) {
    return apiError(error);
  }
});

/**
 * POST /api/tasks - Assign a new task
 */
export const POST = withAuth(async (req) => {
  try {
    if (!req.user) throw new AuthenticationError();

    // Volunteers only receive tasks, they don't assign them.
    requireRole(req.user.role, ["youth-leader", "ro", "sro", "head-ro"]);

    const validatedData = createTaskSchema.parse(await req.json());

    // A developer in the SRO/RO portal (?sroId= / ?roId=) assigns as that person,
    // so the task lands in their "Assigned by me".
    const assigner = await resolveActingAs(req.user, req);

    // You can only assign work to people you manage (as the SRO/RO, when acting as one).
    const assignee = await getUserById(validatedData.assignedTo);
    if (!assignee) throw new NotFoundError("Assignee not found");
    await requireCanManageUser(assigner, assignee);

    const task = await createTask(
      { ...validatedData, dueDate: new Date(validatedData.dueDate) },
      assigner.userId,
      req.user.userId
    );

    return apiSuccess(task, 201);
  } catch (error) {
    return apiError(error);
  }
});
