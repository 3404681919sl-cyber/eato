import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateMealEventView from "../CreateMealEventView";
import { LocalMealEventRepository } from "@/services/localMealEventRepository";
import type { MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "@/services/mealEventRepository";

describe("CreateMealEventView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows a nearby field error and does not save an invalid meal", async () => {
    const repository = new LocalMealEventRepository();
    render(<CreateMealEventView repository={repository} />);

    const title = screen.getByLabelText("饭局名称");
    fireEvent.blur(title);
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    expect(screen.getByText("请填写饭局名称")).toBeInTheDocument();
    await expect(repository.list()).resolves.toEqual([]);
  });

  it("saves one collecting meal locally after a valid submission", async () => {
    const repository = new LocalMealEventRepository();
    render(<CreateMealEventView repository={repository} />);

    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "周五火锅局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    expect(await screen.findByRole("status")).toHaveTextContent("饭局已保存到本设备");
    const events = await repository.list();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ title: "周五火锅局", status: "collecting" });
    expect(screen.getByRole("button", { name: "创建并开始收集" })).toBeDisabled();
  });

  it("notifies the workspace after it has persisted a new meal", async () => {
    const onCreated = vi.fn();
    render(<CreateMealEventView repository={new LocalMealEventRepository()} onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "周五火锅局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ title: "周五火锅局", status: "collecting" })));
  });

  it("creates only the signed-in visitor when opened in cloud mode", async () => {
    const repository = new LocalMealEventRepository();
    render(<CreateMealEventView
      repository={repository}
      mode="cloud"
      cloudCreatorId="00000000-0000-4000-8000-000000000001"
    />);

    expect(screen.getByText("云端协作")).toBeInTheDocument();
    expect(screen.getByText("创建后会保存到云端。当前先创建你本人，后续可邀请成员。")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("饭局名称"), { target: { value: "云端周五火锅局" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    await screen.findByRole("status");
    const [event] = await repository.list();
    expect(event.participantIds).toEqual(["00000000-0000-4000-8000-000000000001"]);
    expect(event.participants).toEqual([{ id: "00000000-0000-4000-8000-000000000001", displayName: "发起人", role: "creator" }]);
  });

  it("keeps the draft visible when local saving fails", async () => {
    const repository: MealEventRepository = {
      list: async () => [],
      getById: async () => null,
      create: async (_event: MealEvent) => { throw new Error("storage full"); },
      save: async (event: MealEvent) => event,
      delete: async () => false,
    };
    render(<CreateMealEventView repository={repository} />);

    const title = screen.getByLabelText("饭局名称");
    fireEvent.change(title, { target: { value: "保留草稿" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    expect(await screen.findByText("本地保存失败，请稍后重试")).toBeInTheDocument();
    expect(title).toHaveValue("保留草稿");
  });

  it("keeps the draft visible and identifies a cloud save failure", async () => {
    const repository: MealEventRepository = {
      list: async () => [],
      getById: async () => null,
      create: async (_event: MealEvent) => { throw new Error("cloud unavailable"); },
      save: async (event: MealEvent) => event,
      delete: async () => false,
    };
    render(<CreateMealEventView
      repository={repository}
      mode="cloud"
      cloudCreatorId="00000000-0000-4000-8000-000000000001"
    />);

    const title = screen.getByLabelText("饭局名称");
    fireEvent.change(title, { target: { value: "云端保留草稿" } });
    fireEvent.click(screen.getByRole("button", { name: "创建并开始收集" }));

    expect(await screen.findByText("云端保存失败，请稍后重试")).toBeInTheDocument();
    expect(title).toHaveValue("云端保留草稿");
  });

  it("lets the creator add and remove simulated members within the allowed range", () => {
    render(<CreateMealEventView repository={new LocalMealEventRepository()} />);

    expect(screen.getAllByLabelText(/成员 \d+ 昵称/)).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "添加成员" }));
    expect(screen.getAllByLabelText(/成员 \d+ 昵称/)).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "移除成员 4" }));
    expect(screen.getAllByLabelText(/成员 \d+ 昵称/)).toHaveLength(3);
  });
});
