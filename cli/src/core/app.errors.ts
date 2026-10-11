import { errorMessage } from "../shared/error.make.ts";
import { fail } from "../shared/output/error.write.ts";

export function runSafely(operation: () => void, writeFailure = fail): void {
  try {
    operation();
  } catch (error) {
    writeFailure(errorMessage(error));
  }
}
