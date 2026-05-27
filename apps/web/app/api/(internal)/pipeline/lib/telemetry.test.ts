import { describe, expect, test, vi } from "vitest";
import { sendTelemetryEvents } from "./telemetry";

describe("sendTelemetryEvents", () => {
  test("is a no-op", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(sendTelemetryEvents()).resolves.toBeUndefined();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
